import type { Mongoose } from 'mongoose'

import { schemaOptions } from '@shared/mongodb/schema-options'
import type { IDatasetProcessedSchema } from './dataset-processed-model.interfaces'

export const DatasetProcessedModel = (mongodbInstance: Mongoose) => {
  const { model, Schema } = mongodbInstance

  const datasetProcessedSchema = new Schema<IDatasetProcessedSchema>(
    {
      filename: {
        type: String,
        required: true,
      },
      processed_at: {
        type: String,
        required: true,
      },
      processing_time_sec: {
        type: Number,
        required: true,
      },
      meta: {
        type: Object,
        required: true,
      },
      chart: {
        type: Object,
        required: true,
      },
    },
    schemaOptions,
  )

  return model<IDatasetProcessedSchema>('Chart', datasetProcessedSchema)
}
