import { IObjectAny } from '@interfaces/object-any'
import type { Document } from 'mongoose'

export const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: Document, ret: IObjectAny) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
    },
  },
  toObject: {
    virtuals: true,
    transform: (_: Document, ret: IObjectAny) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
    },
  },
}
