import { swaggerSpecification } from '@documentation/swagger'
import { swaggerSpecificationOptions } from '@documentation/swagger.constants'
import type { IAppConfig } from '@interfaces/config'
import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

import { ErrorRouter } from './error-router/error-router'
import { MainRouter } from './main-router/main-router'
import { API_PREFIX } from './router-store.constants'

export class RouterStore {
  constructor(app: Express, config: IAppConfig) {
    const mainRouter = new MainRouter(config).router
    const errorRouter = new ErrorRouter().router

    app.use(
      '/documentation',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpecification, swaggerSpecificationOptions),
    )

    app.use(API_PREFIX, mainRouter)

    app.use(errorRouter)
  }
}
