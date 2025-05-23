import { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import type { IDIContainer } from '@interfaces/DI-container'
import { Router } from 'express'
import multer from 'multer'

const upload = multer()

export class AirflowRouter {
  public readonly router = Router()

  constructor(container: IDIContainer) {
    const processDataController = new AirflowController(container)

    this.router.get('/dags', processDataController.getDagList.bind(processDataController))
    this.router.get(
      '/allowed-file-type-list',
      processDataController.getAllowFileTypeList.bind(processDataController),
    )
    this.router.post(
      '/process-data',
      upload.array('file'),
      // @ts-ignore
      processDataController.processData.bind(processDataController),
    )
  }
}
