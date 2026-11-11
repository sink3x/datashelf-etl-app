import type { IDIContainer } from '@interfaces/DI-container'
import type { TMaybe } from '@interfaces/maybe'
import type { IObjectAny } from '@interfaces/object-any'
import type { Channel, ChannelModel } from 'amqplib'
import amqp from 'amqplib'

export class RabbitmqService {
  private config

  public client: TMaybe<ChannelModel> = null
  public channel: TMaybe<Channel> = null

  constructor(container: IDIContainer) {
    const { rabbitmq } = container.config.services

    this.config = rabbitmq

    this.init()
  }

  private async init() {
    await this.connectRabbitMq()
  }

  private async connectRabbitMq() {
    try {
      const connection = await amqp.connect(this.config.url)
      const channel = await connection.createChannel()

      this.client = connection
      this.channel = channel
    } catch (error) {
      console.log(`[status] rabbitmq connection failed ${error}`)
    }
  }

  public async listenQueue(queue: string, callback: (payload: IObjectAny) => {}, onError?: () => {}) {
    if (!this.channel) {
      return
    }

    try {
      await this.channel.assertQueue(queue, { durable: true })

      this.channel.consume(
        queue,
        (rabbitMessage) => {
          if (rabbitMessage) {
            const content = rabbitMessage.content.toString()

            try {
              const payload: IObjectAny = JSON.parse(content)

              callback(payload)

              this.channel!.ack(rabbitMessage)
            } catch {
              onError?.()
              this.channel!.nack(rabbitMessage, false, false)
            }
          }
        },
        { noAck: false },
      )
    } catch (error) {
      console.log(`[RabbitMQ] Failed to listen queue '${queue}':`, error)
    }
  }
}
