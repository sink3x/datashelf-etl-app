import type { IDIContainer } from '@interfaces/DI-container'
import axios from 'axios'

import type {
  TCreateApiAccessTokenRequest,
  TCreateApiAccessTokenResponse,
} from './airflow-service.interfaces'

export class AirflowService {
  private appConfig
  private config

  public apiAcessToken = ''

  constructor(container: IDIContainer) {
    const { config: appConfig } = container

    this.appConfig = appConfig
    this.config = appConfig.services.airflow

    const { intervalToUpdateAirflowAccessToken } = appConfig.vars

    this.createApiAccessToken()

    setInterval(async () => {
      this.createApiAccessToken()
    }, intervalToUpdateAirflowAccessToken)
  }

  private async createApiAccessToken() {
    try {
      const { username, password } = this.config
      const credentials = {
        username,
        password,
      }

      const { data } = await axios.post<TCreateApiAccessTokenRequest, TCreateApiAccessTokenResponse>(
        `${this.config.url}/auth/token`,
        { ...credentials },
      )

      this.apiAcessToken = data.access_token
    } catch (error) {
      const axiosErrorData = error?.response?.data

      console.error('[status] create api access token for airflow failed:', axiosErrorData)
    }
  }

  public get apiHeaders() {
    const headers = {
      authorization: `Bearer ${this.apiAcessToken}`,
    }

    return headers
  }
}
