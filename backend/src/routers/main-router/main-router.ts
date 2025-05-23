import type { IDIContainer } from '@interfaces/DI-container'
import { AirflowRouter } from '@routers/airflow-router/airflow-router'
import { healthcheckController } from '@routers/router-store/router-store.controller'
import { Router } from 'express'

export class MainRouter {
  public readonly router = Router()

  constructor(container: IDIContainer) {
    const airflowRouter = new AirflowRouter(container).router

    this.router.get('/healthcheck', healthcheckController)
    this.router.use('/airflow', airflowRouter)
  }
}
