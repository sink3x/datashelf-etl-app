import type { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import { ALLOWED_FILE_TYPE_LIST } from '@controllers/airflow-controller/airflow-controller.constants'
import { createUploadFileMiddleware } from '@middlewares/upload-file'
import { validateRequest } from '@middlewares/validate-request'
import { dagRunStatusSchemas, processDataSchemas } from '@validations/airflow-validations'
import { Router } from 'express'

export const UPLOAD_FIELD_NAME = 'file'

export const createAirflowRouter = (
  controller: AirflowController,
  options: { maxUploadSizeBytes: number },
) => {
  const router = Router()

  router.get('/dags', controller.getDagList)
  router.get('/allowed-file-type-list', controller.getAllowedFileTypeList)
  router.post(
    '/process-data',
    createUploadFileMiddleware({
      fieldName: UPLOAD_FIELD_NAME,
      maxSizeBytes: options.maxUploadSizeBytes,
      allowedMimeTypes: ALLOWED_FILE_TYPE_LIST,
    }),
    validateRequest(processDataSchemas),
    controller.processData,
  )
  router.get(
    '/dag/status/:dagId/:dagRunId',
    validateRequest(dagRunStatusSchemas),
    controller.getDagStatusByDagRunId,
  )

  return router
}
