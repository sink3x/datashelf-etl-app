import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface IAirflowAuth {
  username: string
  password: string
}

export type TCreateApiAccessTokenRequest = AxiosRequestConfig<IAirflowAuth>
export type TCreateApiAccessTokenResponse = AxiosResponse<{
  access_token: string
}>
