import type { TLogger } from '@shared/logger'
import type { Channel, ChannelModel, ConsumeMessage, Options } from 'amqplib'
import amqp from 'amqplib'

import type { TMessageHandler } from './messaging.interfaces'

export interface IRabbitmqTopology {
  exchange: string
  routingKey: string
  queue: string
  deadLetterExchange: string
  deadLetterQueue: string
}

export interface IReconnectPolicy {
  initialDelayMs: number
  maxDelayMs: number
  maxStartupAttempts: number
}

export interface IRabbitmqConsumerOptions {
  url: string
  topology: IRabbitmqTopology
  prefetch: number
  handler: TMessageHandler
  logger: TLogger
  reconnect?: Partial<IReconnectPolicy>
  connect?: (url: string, socketOptions?: unknown) => Promise<ChannelModel>
}

const DEFAULT_RECONNECT_POLICY: IReconnectPolicy = {
  initialDelayMs: 500,
  maxDelayMs: 30_000,
  maxStartupAttempts: 10,
}

const CONNECTION_NAME = 'datashelf-api'

export const getBackoffDelay = (attempt: number, policy: Pick<IReconnectPolicy, 'initialDelayMs' | 'maxDelayMs'>) =>
  Math.min(policy.maxDelayMs, policy.initialDelayMs * 2 ** Math.max(0, attempt - 1))

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const assertTopology = async (
  channel: Pick<Channel, 'assertExchange' | 'assertQueue' | 'bindQueue'>,
  topology: IRabbitmqTopology,
) => {
  const queueOptions: Options.AssertQueue = {
    durable: true,
    arguments: { 'x-dead-letter-exchange': topology.deadLetterExchange },
  }

  await channel.assertExchange(topology.exchange, 'topic', { durable: true })
  await channel.assertExchange(topology.deadLetterExchange, 'fanout', { durable: true })
  await channel.assertQueue(topology.deadLetterQueue, { durable: true })
  await channel.bindQueue(topology.deadLetterQueue, topology.deadLetterExchange, '')
  await channel.assertQueue(topology.queue, queueOptions)
  await channel.bindQueue(topology.queue, topology.exchange, topology.routingKey)
}

// Settles a delivery only after the handler has finished; rejected messages go to the DLX (requeue=false).
export const dispatchMessage = async (
  channel: Pick<Channel, 'ack' | 'nack'>,
  message: ConsumeMessage,
  handler: TMessageHandler,
  logger: TLogger,
) => {
  let decision: Awaited<ReturnType<TMessageHandler>>

  try {
    decision = await handler({
      content: message.content,
      messageId: message.properties.messageId,
      redelivered: message.fields.redelivered,
    })
  } catch (error) {
    logger.error({ err: error, messageId: message.properties.messageId }, 'message handler failed')
    decision = 'reject'
  }

  try {
    if (decision === 'ack') {
      channel.ack(message)
    } else {
      channel.nack(message, false, false)
    }
  } catch (error) {
    // The channel died mid-flight; the broker redelivers the message and the upsert is idempotent.
    logger.warn({ err: error, messageId: message.properties.messageId }, 'failed to settle message')
  }
}

export class RabbitmqConsumer {
  private readonly policy: IReconnectPolicy
  private readonly connect: NonNullable<IRabbitmqConsumerOptions['connect']>
  private readonly logger: TLogger
  private readonly inFlight = new Set<Promise<void>>()

  private connection: ChannelModel | null = null
  private channel: Channel | null = null
  private consumerTag: string | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempt = 0
  private closing = false

  constructor(private readonly options: IRabbitmqConsumerOptions) {
    this.policy = { ...DEFAULT_RECONNECT_POLICY, ...options.reconnect }
    this.connect = options.connect ?? ((url, socketOptions) => amqp.connect(url, socketOptions))
    this.logger = options.logger.child({ component: 'rabbitmq-consumer' })
  }

  public isReady() {
    return !this.closing && this.channel !== null && this.consumerTag !== null
  }

  public async start() {
    for (let attempt = 1; ; attempt += 1) {
      try {
        await this.connectAndConsume()

        return
      } catch (error) {
        if (attempt >= this.policy.maxStartupAttempts || this.closing) {
          throw error
        }

        const delay = getBackoffDelay(attempt, this.policy)

        this.logger.warn({ err: error, attempt, delay }, 'rabbitmq not reachable yet, retrying')
        await sleep(delay)
      }
    }
  }

  public async stop() {
    this.closing = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    const { channel, connection, consumerTag } = this

    if (channel && consumerTag) {
      await channel.cancel(consumerTag).catch((error) => this.logger.warn({ err: error }, 'cancel failed'))
    }

    await Promise.allSettled([...this.inFlight])

    await channel?.close().catch(() => undefined)
    await connection?.close().catch(() => undefined)

    this.channel = null
    this.connection = null
    this.consumerTag = null
    this.logger.info('rabbitmq consumer stopped')
  }

  private async connectAndConsume() {
    const { url, topology, prefetch, handler } = this.options
    const connection = await this.connect(url, { clientProperties: { connection_name: CONNECTION_NAME } })

    try {
      connection.on('error', (error) => this.logger.error({ err: error }, 'rabbitmq connection error'))
      connection.on('close', () => this.handleConnectionClosed(connection))

      const channel = await connection.createChannel()

      channel.on('error', (error) => this.logger.error({ err: error }, 'rabbitmq channel error'))
      channel.on('close', () => {
        if (!this.closing && this.channel === channel) {
          connection.close().catch(() => undefined)
        }
      })

      await assertTopology(channel, topology)
      await channel.prefetch(prefetch)

      const { consumerTag } = await channel.consume(
        topology.queue,
        (message) => {
          if (!message) {
            this.logger.warn('consumer cancelled by broker')
            connection.close().catch(() => undefined)

            return
          }

          const task = dispatchMessage(channel, message, handler, this.logger)

          this.inFlight.add(task)
          task.finally(() => this.inFlight.delete(task))
        },
        { noAck: false },
      )

      this.connection = connection
      this.channel = channel
      this.consumerTag = consumerTag
      this.reconnectAttempt = 0
      this.logger.info({ queue: topology.queue, prefetch }, 'rabbitmq consumer started')
    } catch (error) {
      await connection.close().catch(() => undefined)
      throw error
    }
  }

  private handleConnectionClosed(connection: ChannelModel) {
    if (connection !== this.connection) {
      return
    }

    this.connection = null
    this.channel = null
    this.consumerTag = null

    if (this.closing) {
      return
    }

    this.logger.warn('rabbitmq connection closed, reconnecting')
    this.scheduleReconnect()
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.closing) {
      return
    }

    this.reconnectAttempt += 1

    const delay = getBackoffDelay(this.reconnectAttempt, this.policy)

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null

      try {
        await this.connectAndConsume()
      } catch (error) {
        this.logger.error({ err: error, attempt: this.reconnectAttempt }, 'rabbitmq reconnect failed')
        this.scheduleReconnect()
      }
    }, delay)
  }
}
