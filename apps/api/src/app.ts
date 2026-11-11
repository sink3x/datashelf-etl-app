import type { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import type { DatasetController } from '@controllers/dataset-controller/dataset-controller'
import type { HealthController } from '@controllers/health-controller/health-controller'
import { swaggerSpecificationOptions } from '@documentation/swagger.constants'
import { buildSwaggerSpecification } from '@documentation/swagger.utils'
import { createErrorHandler, notFoundHandler } from '@middlewares/error-handler'
import { createRequestLogger } from '@middlewares/request-logger'
import { createHealthRouter } from '@routers/health-router/health-router'
import { createMainRouter } from '@routers/main-router/main-router'
import { API_PREFIX } from '@shared/constants'
import type { TLogger } from '@shared/logger'
import { PUBLIC_DIR } from '@shared/paths'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import type { Express } from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'

export interface IAppDependencies {
  logger: TLogger
  corsOrigins: string[]
  maxUploadSizeBytes: number
  maxUploadSizeMb: number
  airflowController: AirflowController
  datasetController: DatasetController
  healthController: HealthController
  enableDocs?: boolean
}

export const createApp = (dependencies: IAppDependencies): Express => {
  const { logger, corsOrigins, enableDocs = true } = dependencies
  const app = express()

  app.disable('x-powered-by')
  app.use(createRequestLogger(logger))
  app.use(createHealthRouter(dependencies.healthController))

  app.use(cors({ origin: corsOrigins.includes('*') ? '*' : corsOrigins }))
  app.use(helmet())
  app.use(compression())
  app.use(express.json({ limit: '100kb' }))
  app.use(express.static(PUBLIC_DIR))

  if (enableDocs) {
    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(buildSwaggerSpecification(logger), swaggerSpecificationOptions),
    )
  }

  app.use(API_PREFIX, createMainRouter(dependencies))

  app.use(notFoundHandler)
  app.use(createErrorHandler(logger, { maxUploadSizeMb: dependencies.maxUploadSizeMb }))

  return app
}
