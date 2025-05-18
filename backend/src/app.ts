import type { IAppConfig } from '@interfaces/config'
import type { TMaybe } from '@interfaces/maybe'
import { RouterStore } from '@routers/router-store'
import { isDevelopment } from '@shared/constants'
import { loadConfig } from '@utils/load-config'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import appConfig from '../configs/app.local.json'

export class App {
  private readonly app = express()

  public config: TMaybe<IAppConfig> = null

  constructor() {
    this.setupConfig()
    this.setupMiddleWareList()
    this.setupRouteList()
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

  private setupRouteList() {
    new RouterStore(this.app, this.config!)
  }

  private setupConfig() {
    if (isDevelopment) {
      this.config = appConfig as IAppConfig

      return
    }

    this.config = loadConfig()
  }

  public start() {
    if (!this.config) {
      console.log(`[status] start app failed: no config `)

      require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      return
    }

    const { host, port } = this.config.server

    this.app.listen(port, () => {
      console.log(`[status] start app successful: http://${host}:${port}`)
    })
  }
}
