import type { IAppConfig } from '@interfaces/config'
import axios from 'axios'
import type { Request } from 'express'

import type {
  IAirflowAuth,
  TGetDagListAirflowRequest,
  TGetDagListAirflowResponse,
  TGetDagListResponse,
} from './process-data-controller.interfaces'

export class ProcessDataController {
  public config: IAppConfig

  public airflowAuth: IAirflowAuth
  public airflowUrl: string

  constructor(config: IAppConfig) {
    const { airflow } = config.services

    this.config = config

    this.airflowUrl = airflow.url
    this.airflowAuth = {
      username: airflow.username,
      password: airflow.password,
    }
  }

  public async getDagList(_request: Request, response: TGetDagListResponse) {
    try {
      const { data } = await axios<TGetDagListAirflowRequest, TGetDagListAirflowResponse>(
        `${this.airflowUrl}/v1/dags`,
        {
          auth: this.airflowAuth,
        },
      )

      response.status(200).json({
        dags: data.dags,
        total_entries: data.total_entries,
        message: 'Ok',
      })
    } catch {
      response.status(500).json({
        message: 'Failed to get dags',
      })
    }
  }
}
