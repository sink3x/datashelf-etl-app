import type { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import type { DatasetController } from '@controllers/dataset-controller/dataset-controller'
import type { HealthController } from '@controllers/health-controller/health-controller'
import { createAirflowRouter } from '@routers/airflow-router/airflow-router'
import { createDatasetRouter } from '@routers/dataset-router/dataset-router'
import { Router } from 'express'

export interface IMainRouterDependencies {
  airflowController: AirflowController
  datasetController: DatasetController
  healthController: HealthController
  maxUploadSizeBytes: number
}

export const createMainRouter = (dependencies: IMainRouterDependencies) => {
  const router = Router()

  router.get('/healthcheck', dependencies.healthController.legacyHealthcheck)
  router.use(
    '/airflow',
    createAirflowRouter(dependencies.airflowController, {
      maxUploadSizeBytes: dependencies.maxUploadSizeBytes,
    }),
  )
  router.use('/dataset', createDatasetRouter(dependencies.datasetController))

  return router
}
