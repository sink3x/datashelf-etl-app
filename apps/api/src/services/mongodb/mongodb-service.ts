import type { IDIContainer } from '@interfaces/DI-container'
import type { TMaybe } from '@interfaces/maybe'
import { DatasetProcessedModel } from '@models/dataset-processed-model/dataset-processed-model'
import type { Mongoose } from 'mongoose'
import mongoose from 'mongoose'

import type { TMongodbClassPropertyModel } from './mongodb-service.interfaces'

export class MongodbService {
  private config
  private logger

  public client: TMaybe<Mongoose> = null
  public models: TMongodbClassPropertyModel = {} as TMongodbClassPropertyModel

  constructor(container: IDIContainer) {
    const { config } = container
    const { mongodb } = config

    this.config = mongodb
    this.logger = container.logger.child({ component: 'mongodb' })

    this.init()
  }

  private async connectDb() {
    try {
      await mongoose.connect(this.config.uri, {
        dbName: this.config.dbName,
        autoIndex: false,
        serverSelectionTimeoutMS: 10000,
      })

      this.client = mongoose
    } catch (error) {
      this.logger.error({ err: error }, 'mongodb connection failed')
    }
  }

  private initModels() {
    const datasetProcessed = DatasetProcessedModel(this.client!)

    const models = { datasetProcessed } as unknown as TMongodbClassPropertyModel

    this.models = models
  }

  private async init() {
    await this.connectDb()
    this.initModels()
  }
}
