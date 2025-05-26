import { DatasetController } from '@controllers/dataset-controller/dataset-controller'
import type { IDIContainer } from '@interfaces/DI-container'
import { Router } from 'express'

export class DatasetRouter {
  public readonly router = Router()

  constructor(container: IDIContainer) {
    const datasetController = new DatasetController(container)

    this.router.get('/processed', datasetController.getProcessed.bind(datasetController))
    this.router.get('/raw', datasetController.getRaw.bind(datasetController))
  }
}
