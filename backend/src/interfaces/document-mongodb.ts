import type { Document } from 'mongoose'

export interface IDocumentMongodb<T> extends Omit<Document<T>, '_id' | '__v'> {
  id: string
}
