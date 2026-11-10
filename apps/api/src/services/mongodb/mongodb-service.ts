import type { IDIContainer } from '@interfaces/DI-container'
import type { TMaybe } from '@interfaces/maybe'
import { DatasetProcessedModel } from '@models/dataset-processed-model/dataset-processed-model'
import type { Mongoose } from 'mongoose'
import mongoose from 'mongoose'

import type { TMongodbClassPropertyModel } from './mongodb-service.interfaces'

export class MongodbService {
  private config

  public client: TMaybe<Mongoose> = null
  public models: TMongodbClassPropertyModel = {} as TMongodbClassPropertyModel

  constructor(container: IDIContainer) {
    const { config } = container
    const { mongodb } = config.services

    this.config = mongodb

    this.init()
  }

  private async connectDb() {
    try {
      await mongoose.connect(this.config.uri, this.config.parameters)

      this.client = mongoose
    } catch (error) {
      console.log(`[status] mongodb connection failed ${error}`)
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
