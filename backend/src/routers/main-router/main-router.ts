import type { IAppConfig } from '@interfaces/config'
import { ProcessDataRouter } from '@routers/process-data-router/process-data-router'
import { healthcheckController } from '@routers/router-store.controller'
import { Router } from 'express'

export class MainRouter {
  public readonly router = Router()

  constructor(config: IAppConfig) {
    const processDataRouter = new ProcessDataRouter(config).router

    this.router.get('/healthcheck', healthcheckController)
    this.router.use('/process-data', processDataRouter)
  }
}
