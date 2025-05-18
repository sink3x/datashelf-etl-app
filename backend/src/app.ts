import type { IAppConfig } from '@interfaces/config'
import type { TMaybe } from '@interfaces/maybe'
import { RouterStore } from '@routers/router-store'
import { APP_MODE } from '@shared/constants'
import { loadConfig } from '@utils/load-config'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

export class App {
  private readonly app = express()

  public config: TMaybe<IAppConfig> = null

  constructor() {
    this.setupConfig()

    if (!this.config) {
      return
    }

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
    const loadedConfig = loadConfig(APP_MODE)

    if (!loadedConfig) {
      return
    }

    this.config = loadedConfig
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

    const { protocol, host, port } = this.config.server

    this.app.listen(port, () => {
      console.log(`[status] start app successful: ${protocol}://${host}:${port}`)
    })
  }
}
