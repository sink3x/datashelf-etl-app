import type { IAppConfig } from '@config/config'
import type { TAppServices } from '@interfaces/config'
import type { IDIContainer } from '@interfaces/DI-container'
import type { TMaybe } from '@interfaces/maybe'
import { createRequestLogger } from '@middlewares/request-logger'
import { RouterStore } from '@routers/router-store/router-store'
import { AirflowService } from '@services/airflow/airflow-service'
import { MongodbService } from '@services/mongodb/mongodb-service'
import { RabbitmqService } from '@services/rabbitmq/rabbitmq-service'
import { S3Service } from '@services/s3/s3-service'
import type { TLogger } from '@shared/logger'
import { addProcessedDataset } from '@utils/add-processed-dataset/add-processed-dataset'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

const QUEUE_LISTEN_RETRY_INTERVAL_MS = 1000

export class App {
  private readonly app = express()
  private services: TMaybe<TAppServices> = null

  constructor(
    private readonly config: IAppConfig,
    private readonly logger: TLogger,
  ) {
    this.setupServiceList()
    this.setupMiddleWareList()
    this.setupRouterList()

    const intervalIdCheckListenQueue = setInterval(() => {
      this.setupListenQueue(() => clearInterval(intervalIdCheckListenQueue))
    }, QUEUE_LISTEN_RETRY_INTERVAL_MS)
  }

  private setupServiceList() {
    const container = { config: this.config, logger: this.logger } as IDIContainer

    this.services = {
      s3: new S3Service(container),
      airflow: new AirflowService(container),
      mongodb: new MongodbService(container),
      rabbitmq: new RabbitmqService(container),
    }
  }

  private setupMiddleWareList() {
    this.app.disable('x-powered-by')
    this.app.use(createRequestLogger(this.logger))
    this.app.use(
      cors({
        origin: this.config.corsOrigins.includes('*') ? '*' : this.config.corsOrigins,
      }),
    )

    this.app.use(helmet())
    this.app.use(express.json())
    this.app.use(compression())
  }

  private setupRouterList() {
    new RouterStore({ app: this.app, config: this.config, logger: this.logger, services: this.services! })
  }

  private setupListenQueue(callback: () => void) {
    if (!this.services?.rabbitmq || !this.services?.mongodb) {
      return
    }

    callback()

    const addProcessedDatasetToMongodb = addProcessedDataset(this.services.mongodb)

    this.services.rabbitmq.listenQueue(
      this.config.rabbitmq.queue,
      addProcessedDatasetToMongodb(this.logger),
    )
  }

  public start() {
    const { port } = this.config

    this.app.listen(port, () => {
      this.logger.info({ port }, 'http server listening')
    })
  }
}
