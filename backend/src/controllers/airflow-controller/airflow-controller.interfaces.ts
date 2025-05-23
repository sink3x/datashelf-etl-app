import type { IDagInfo } from '@interfaces/dag'
import type { TMaybe } from '@interfaces/maybe'
import type { IMulterFile } from '@interfaces/multer-file'
import type { IObjectAny } from '@interfaces/object-any'
import type { TRequestBody } from '@interfaces/request'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Response } from 'express'

import type { ALLOWLABLE_FILE_TYPE_LIST } from './airflow-controller.constants'

export interface IDagTriggeredInfo {
  dag_run_id: string
  dag_id: string
  logical_date: string // ISO 8601 timestamp
  queued_at: string
  start_date: TMaybe<string>
  end_date: TMaybe<string>
  data_interval_start: string
  data_interval_end: string
  run_after: string
  last_scheduling_decision: TMaybe<string>
  run_type: 'manual' | 'scheduled'
  state: 'queued' | 'running' | 'success' | 'failed'
  triggered_by: string
  conf: IObjectAny
  note: TMaybe<string>
  dag_versions: Array<{
    id: string
    version_number: number
    dag_id: string
    bundle_name: string
    bundle_version: TMaybe<string>
    created_at: string
    bundle_url: TMaybe<string>
  }>
  bundle_version: TMaybe<string>
}

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
}>
