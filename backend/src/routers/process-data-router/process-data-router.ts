import { ProcessDataController } from '@controllers/process-data-controller/process-data-controller'
import type { IAppConfig } from '@interfaces/config'
import { Router } from 'express'

export class ProcessDataRouter {
  public readonly router = Router()

  constructor(config: IAppConfig) {
    const processDataController = new ProcessDataController(config)

    this.router.get('/dags', processDataController.getDagList.bind(processDataController))
  }
}
