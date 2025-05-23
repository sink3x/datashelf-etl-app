import type { IAppConfig, TAppServices } from '@interfaces/config'
import type { TMaybe } from '@interfaces/maybe'
import { RouterStore } from '@routers/router-store/router-store'
import { AirflowService } from '@services/airflow/airflow-service'
import { S3Service } from '@services/s3/s3-service'
import { APP_MODE } from '@shared/constants'
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

    this.setupServiceList()
    this.setupMiddleWareList()
    this.setupRouterList()
  }

  private setupServiceList() {
    this.services = {
      // @ts-ignore
      s3: new S3Service({ config: this.config! }),
      // @ts-ignore
      airflow: new AirflowService({ config: this.config! }),
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
