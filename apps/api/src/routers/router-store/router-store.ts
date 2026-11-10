import { swaggerSpecification } from '@documentation/swagger'
import { swaggerSpecificationOptions } from '@documentation/swagger.constants'
import type { IDIContainer } from '@interfaces/DI-container'
import { createErrorHandler, notFoundHandler } from '@middlewares/error-handler'
import { PUBLIC_DIR } from '@shared/paths'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { API_PREFIX } from './router-store.constants'
import { MainRouter } from '../main-router/main-router'


export class RouterStore {
  constructor(container: IDIContainer) {
    const { app, config, logger } = container

    const mainRouter = new MainRouter(container).router

    app.use(express.static(PUBLIC_DIR))

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification, swaggerSpecificationOptions))

    app.use(API_PREFIX, mainRouter)

    app.use(notFoundHandler)
    app.use(createErrorHandler(logger, { maxUploadSizeMb: config.upload.maxSizeMb }))
  }
}
