import type { IObjectAny } from '@interfaces/object-any'
import type { Model } from 'mongoose'

export type TModelKey = 'datasetProcessed'

export type TMongodbClassPropertyModel = Record<TModelKey, Model<IObjectAny>>
