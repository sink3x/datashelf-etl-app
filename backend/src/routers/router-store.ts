import type { IAppConfig } from '@interfaces/config'
import type { Express } from 'express'

import { ErrorRouter } from './error-router/error-router'
import { MainRouter } from './main-router/main-router'
import { API_PREFIX } from './router-store.constants'
import { healthcheckController } from './router-store.controller'

export class RouterStore {
  constructor(app: Express, config: IAppConfig) {
    const mainRouter = new MainRouter(config).router
    const errorRouter = new ErrorRouter().router

    app.get('/healtcheck', healthcheckController)
    app.use(API_PREFIX, mainRouter)

    app.use(errorRouter)
  }
}
