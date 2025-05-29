import type { IObjectAny } from '@interfaces/object-any'
import type { MongodbService } from '@services/mongodb/mongodb-service'

export const addProcessedDataset = (mongodbService: MongodbService) => async (payload: IObjectAny) => {
  try {
    if (Array.isArray(payload)) {
      await mongodbService.models.datasetProcessed.insertMany(payload)

      return
    }

    await mongodbService.models.datasetProcessed.insertOne(payload)
  } catch {}
}
