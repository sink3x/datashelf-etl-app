import { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import type { IDIContainer } from '@interfaces/DI-container'
import { Router } from 'express'
import multer from 'multer'

const upload = multer()

export class AirflowRouter {
  public readonly router = Router()

  constructor(container: IDIContainer) {
    const airflowController = new AirflowController(container)

    this.router.get('/dags', airflowController.getDagList.bind(airflowController))
    this.router.get('/allowed-file-type-list', airflowController.getAllowFileTypeList.bind(airflowController))
    this.router.post(
      '/process-data',
      upload.array('file'),
      // @ts-ignore
      airflowController.processData.bind(airflowController),
    )
    this.router.get(
      '/dag/status/:dagId/:dagRunId',
      airflowController.getDagStatusByDagRunId.bind(airflowController),
    )
  }
}
