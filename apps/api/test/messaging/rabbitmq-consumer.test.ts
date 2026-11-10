import { EventEmitter } from 'events'

import type { ChannelModel, ConsumeMessage } from 'amqplib'
import { describe, expect, it, vi } from 'vitest'

import type { TMessageDecision } from '../../src/messaging/messaging.interfaces'
import {
  assertTopology,
  dispatchMessage,
  getBackoffDelay,
  RabbitmqConsumer,
} from '../../src/messaging/rabbitmq-consumer'
import { silentLogger } from '../helpers'

const topology = {
  exchange: 'datashelf.events',
  routingKey: 'dataset.charts.computed',
  queue: 'datashelf.api.charts-computed',
  deadLetterExchange: 'datashelf.events.dlx',
  deadLetterQueue: 'datashelf.api.charts-computed.dlq',
}

const createMessage = () =>
  ({
    content: Buffer.from('{}'),
    fields: { redelivered: false },
    properties: { messageId: 'message-1' },
  }) as unknown as ConsumeMessage

const createChannel = () =>
  Object.assign(new EventEmitter(), {
    ack: vi.fn(),
    nack: vi.fn(),
    assertExchange: vi.fn(async () => ({}) as never),
    assertQueue: vi.fn(async () => ({}) as never),
    bindQueue: vi.fn(async () => ({}) as never),
    prefetch: vi.fn(async () => ({})),
    consume: vi.fn(async () => ({ consumerTag: 'tag-1' })),
    cancel: vi.fn(async () => ({})),
    close: vi.fn(async () => undefined),
  })

const createConnection = (channel = createChannel()) => {
  const connection = Object.assign(new EventEmitter(), {
    createChannel: vi.fn(async () => channel),
    close: vi.fn(async () => {
      connection.emit('close')
    }),
  })

  return connection
}

describe('dispatchMessage', () => {
  it('acks only after the handler has resolved', async () => {
    const channel = createChannel()
    let resolveHandler: (decision: TMessageDecision) => void = () => undefined
    const handler = vi.fn(() => new Promise<TMessageDecision>((resolve) => (resolveHandler = resolve)))

    const dispatched = dispatchMessage(channel, createMessage(), handler, silentLogger)

    await Promise.resolve()
    expect(channel.ack).not.toHaveBeenCalled()

    resolveHandler('ack')
    await dispatched

    expect(channel.ack).toHaveBeenCalledOnce()
    expect(channel.nack).not.toHaveBeenCalled()
  })

  it('dead-letters rejected messages without requeueing', async () => {
    const channel = createChannel()
    const message = createMessage()

    await dispatchMessage(channel, message, async () => 'reject', silentLogger)

    expect(channel.nack).toHaveBeenCalledWith(message, false, false)
    expect(channel.ack).not.toHaveBeenCalled()
  })

  it('dead-letters when the handler throws', async () => {
    const channel = createChannel()
    const message = createMessage()

    await dispatchMessage(
      channel,
      message,
      async () => {
        throw new Error('boom')
      },
      silentLogger,
    )

    expect(channel.nack).toHaveBeenCalledWith(message, false, false)
  })
})

describe('assertTopology', () => {
  it('declares the exchange, DLX, DLQ and the dead-lettered work queue', async () => {
    const channel = createChannel()

    await assertTopology(channel, topology)

    expect(channel.assertExchange).toHaveBeenCalledWith('datashelf.events', 'topic', { durable: true })
    expect(channel.assertExchange).toHaveBeenCalledWith('datashelf.events.dlx', 'fanout', { durable: true })
    expect(channel.assertQueue).toHaveBeenCalledWith('datashelf.api.charts-computed.dlq', { durable: true })
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'datashelf.api.charts-computed.dlq',
      'datashelf.events.dlx',
      '',
    )
    expect(channel.assertQueue).toHaveBeenCalledWith('datashelf.api.charts-computed', {
      durable: true,
      arguments: { 'x-dead-letter-exchange': 'datashelf.events.dlx' },
    })
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'datashelf.api.charts-computed',
      'datashelf.events',
      'dataset.charts.computed',
    )
  })
})

describe('RabbitmqConsumer', () => {
  const createConsumer = (connect: () => Promise<unknown>) =>
    new RabbitmqConsumer({
      url: 'amqp://localhost',
      topology,
      prefetch: 5,
      handler: async () => 'ack',
      logger: silentLogger,
      reconnect: { initialDelayMs: 1, maxDelayMs: 2, maxStartupAttempts: 3 },
      connect: connect as () => Promise<ChannelModel>,
    })

  it('grows the backoff exponentially up to the cap', () => {
    const policy = { initialDelayMs: 100, maxDelayMs: 1000 }

    expect([1, 2, 3, 4, 5].map((attempt) => getBackoffDelay(attempt, policy))).toEqual([
      100, 200, 400, 800, 1000,
    ])
  })

  it('retries the initial connection and starts consuming with the configured prefetch', async () => {
    const channel = createChannel()
    const connect = vi
      .fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValue(createConnection(channel))
    const consumer = createConsumer(connect)

    await consumer.start()

    expect(connect).toHaveBeenCalledTimes(2)
    expect(channel.prefetch).toHaveBeenCalledWith(5)
    expect(channel.consume).toHaveBeenCalledWith(topology.queue, expect.any(Function), { noAck: false })
    expect(consumer.isReady()).toBe(true)
  })

  it('gives up after the configured number of startup attempts', async () => {
    const connect = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(createConsumer(connect).start()).rejects.toThrow('ECONNREFUSED')
    expect(connect).toHaveBeenCalledTimes(3)
  })

  it('reconnects after the broker closes the connection', async () => {
    const firstConnection = createConnection()
    const secondChannel = createChannel()
    const connect = vi
      .fn()
      .mockResolvedValueOnce(firstConnection)
      .mockResolvedValueOnce(createConnection(secondChannel))
    const consumer = createConsumer(connect)

    await consumer.start()
    firstConnection.emit('close')

    expect(consumer.isReady()).toBe(false)
    await vi.waitFor(() => expect(consumer.isReady()).toBe(true))
    expect(connect).toHaveBeenCalledTimes(2)
    expect(secondChannel.consume).toHaveBeenCalledOnce()
  })

  it('cancels consumption and does not reconnect after stop', async () => {
    const channel = createChannel()
    const connect = vi.fn().mockResolvedValue(createConnection(channel))
    const consumer = createConsumer(connect)

    await consumer.start()
    await consumer.stop()

    expect(channel.cancel).toHaveBeenCalledWith('tag-1')
    expect(consumer.isReady()).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(connect).toHaveBeenCalledOnce()
  })
})
