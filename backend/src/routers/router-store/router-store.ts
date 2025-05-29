import { swaggerSpecification } from '@documentation/swagger'
import { swaggerSpecificationOptions } from '@documentation/swagger.constants'
import type { IDIContainer } from '@interfaces/DI-container'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { ErrorRouter } from '../error-router/error-router'
import { MainRouter } from '../main-router/main-router'
// eslint-disable-next-line import-x/order
import path from 'path'
import { API_PREFIX } from './router-store.constants'

export class RouterStore {
  constructor(container: IDIContainer) {
    const { app } = container

    const mainRouter = new MainRouter(container).router
    const errorRouter = new ErrorRouter().router

    app.use(express.static(path.join(__dirname, '../../../public')))

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification, swaggerSpecificationOptions))

    app.use(API_PREFIX, mainRouter)

    app.use(errorRouter)
  }
}
