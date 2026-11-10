import { swaggerSpecification } from '@documentation/swagger'
import { swaggerSpecificationOptions } from '@documentation/swagger.constants'
import type { IDIContainer } from '@interfaces/DI-container'
import { PUBLIC_DIR } from '@shared/paths'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { API_PREFIX } from './router-store.constants'
import { ErrorRouter } from '../error-router/error-router'
import { MainRouter } from '../main-router/main-router'


export class RouterStore {
  constructor(container: IDIContainer) {
    const { app } = container

    const mainRouter = new MainRouter(container).router
    const errorRouter = new ErrorRouter().router

    app.use(express.static(PUBLIC_DIR))

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification, swaggerSpecificationOptions))

    app.use(API_PREFIX, mainRouter)

    app.use(errorRouter)
  }
}
