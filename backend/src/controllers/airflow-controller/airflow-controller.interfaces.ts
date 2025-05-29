import type { IDagInfo, IDagStatus, IDagTriggeredInfo } from '@interfaces/dag'
import type { IMulterFile } from '@interfaces/multer-file'
import type { IObjectAny } from '@interfaces/object-any'
import type { TRequestBody, TRequestParams } from '@interfaces/request'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Response } from 'express'

import { IResponseMeta } from '@interfaces/response-meta'
import type { ALLOWLABLE_FILE_TYPE_LIST } from './airflow-controller.constants'

export type TGetDagListAirflowRequest = AxiosRequestConfig<{}>

export type TGetDagListAirflowResponse = AxiosResponse<{
  dags: IDagInfo[]
  total_entries: number
}>

export type TGetDagListResponse = Response<{
  dags?: IDagInfo[]
  total_entries?: number
  message: string
  info?: IObjectAny
  meta?: IResponseMeta
}>

export type TProcessDataRequest = TRequestBody<{
  dagId?: string
}> & {
  files?: IMulterFile[]
}

export type TProcessDataResponse = Response<{
  message: string
  triggeredDagInfo?: IDagTriggeredInfo
  info?: IObjectAny
}>

export type TGetAllowFileTypeListResponse = Response<{
  message: string
  allowedFileTypeList: typeof ALLOWLABLE_FILE_TYPE_LIST
  meta?: IResponseMeta
}>

export type TGetDagStatusByDagRunIdRequest = TRequestParams<{
  dagId: string
  dagRunId: string
}>

export type TGetDagStatusByDagRunIdResponse = Response<{
  message: string
  dagStatus?: IDagStatus
  info?: IObjectAny
}>
