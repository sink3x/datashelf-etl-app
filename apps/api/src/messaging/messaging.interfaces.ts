export type TMessageDecision = 'ack' | 'reject'

export interface IIncomingMessage {
  content: Buffer
  messageId?: string
  redelivered: boolean
}

export type TMessageHandler = (message: IIncomingMessage) => Promise<TMessageDecision>
