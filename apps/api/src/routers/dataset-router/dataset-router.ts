import type { DatasetController } from '@controllers/dataset-controller/dataset-controller'
import { validateRequest } from '@middlewares/validate-request'
import { chartsSchemas, rawListSchemas } from '@validations/dataset-validations'
import { Router } from 'express'

export const createDatasetRouter = (controller: DatasetController) => {
  const router = Router()

  router.get('/processed', controller.getProcessed)
  router.get('/raw', validateRequest(rawListSchemas), controller.getRaw)
  router.get('/charts/:filename', validateRequest(chartsSchemas), controller.getCharts)

  return router
}
