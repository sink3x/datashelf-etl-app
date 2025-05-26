import type { Mongoose } from 'mongoose'

import type { IDatasetProcessedSchema } from './dataset-processed-model.interfaces'

export const DatasetProcessedModel = (mongodbInstance: Mongoose) => {
  const { model, Schema } = mongodbInstance

  const datasetProcessedSchema = new Schema<IDatasetProcessedSchema>({
    key: {
      type: String,
    },
  })

  return model<IDatasetProcessedSchema>('datasets', datasetProcessedSchema)
}
