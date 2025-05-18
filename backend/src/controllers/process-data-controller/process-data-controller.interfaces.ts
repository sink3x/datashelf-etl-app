import type { IDagInfo } from '@interfaces/dag'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Response } from 'express'

export interface IAirflowAuth {
  username: string
  password: string
}

export type TGetDagListAirflowRequest = AxiosRequestConfig<{
  auth: IAirflowAuth
}>
export type TGetDagListAirflowResponse = AxiosResponse<{
  dags: IDagInfo[]
  total_entries: number
}>

export type TGetDagListResponse = Response<{
  dags?: IDagInfo[]
  total_entries?: number
  message: string
}>
