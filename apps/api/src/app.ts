import type { IAppConfig, TAppServices } from '@interfaces/config'
import type { IDIContainer } from '@interfaces/DI-container'
import type { TMaybe } from '@interfaces/maybe'
import { RouterStore } from '@routers/router-store/router-store'
import { AirflowService } from '@services/airflow/airflow-service'
import { MongodbService } from '@services/mongodb/mongodb-service'
import { RabbitmqService } from '@services/rabbitmq/rabbitmq-service'
import { S3Service } from '@services/s3/s3-service'
import { APP_MODE } from '@shared/constants'
import { addProcessedDataset } from '@utils/add-processed-dataset/add-processed-dataset'
import { loadConfig } from '@utils/load-config'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

export class App {
  private readonly app = express()
  private config: TMaybe<IAppConfig> = null
  private services: TMaybe<TAppServices> = null

  constructor() {
    this.setupConfig()

    if (!this.config) {
      return
    }

    const { intervalToCheckRabbitAndMongoStatus } = this.config.vars

    this.setupServiceList()
    this.setupMiddleWareList()
    this.setupRouterList()

    const intervalIdCheckListenQueue = setInterval(() => {
      this.setupListenQueue(() => clearInterval(intervalIdCheckListenQueue))
    }, intervalToCheckRabbitAndMongoStatus)
  }

  private setupServiceList() {
    const container = { config: this.config! } as IDIContainer

    this.services = {
      s3: new S3Service(container),
      airflow: new AirflowService(container),
      mongodb: new MongodbService(container),
      rabbitmq: new RabbitmqService(container),
    }
  }

  private setupMiddleWareList() {
    this.app.use(
      cors({
        origin: '*',
      }),
    )

    this.app.use(helmet())
    this.app.use(express.json())
    this.app.use(compression())
  }

  private setupRouterList() {
    new RouterStore({ app: this.app, config: this.config!, services: this.services! })
  }

  private setupConfig() {
    const loadedConfig = loadConfig(APP_MODE)

    this.config = loadedConfig!
  }

  private setupListenQueue(callback: () => void) {
    if (!this.services?.rabbitmq || !this.services?.mongodb) {
      return
    }

    callback()

    const addProcessedDatasetToMongodb = addProcessedDataset(this.services.mongodb)

    this.services.rabbitmq.listenQueue(this.config!.services.rabbitmq.queue, addProcessedDatasetToMongodb)
  }

  public start() {
    if (!this.config) {
      throw new Error('setup config failed: no app connfig')
    }

    const { protocol, host, port } = this.config.server

    this.app.listen(port, () => {
      console.log(`[status] start app successful: ${protocol}://${host}:${port}`)
    })
  }
}
