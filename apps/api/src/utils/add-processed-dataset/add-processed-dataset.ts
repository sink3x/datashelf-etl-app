import type { IObjectAny } from '@interfaces/object-any'
import type { MongodbService } from '@services/mongodb/mongodb-service'
import type { TLogger } from '@shared/logger'

export const addProcessedDataset =
  (mongodbService: MongodbService) => (logger: TLogger) => async (payload: IObjectAny) => {
  try {
    if (Array.isArray(payload)) {
      await mongodbService.models.datasetProcessed.insertMany(payload)

      return
    }

    await mongodbService.models.datasetProcessed.insertOne(payload)
  } catch (error) {
    logger.error({ err: error }, 'failed to store processed dataset')
  }
}
