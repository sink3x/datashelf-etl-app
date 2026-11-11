import type { IApiResponse } from '@interfaces/api-response'
import type { IDag, IDagRun } from '@interfaces/dag'

export interface IGetDagListResponse extends IApiResponse {
	dags?: IDag[]
	total_entries?: number
}

export interface IGetAllowedFileTypesResponse extends IApiResponse {
	allowedFileTypeList: string[]
}

export interface IUploadRawDataParams {
	file: File
	dagId: string
	onProgress?: (percent: number) => void
}

export interface IUploadRawDataResponse extends IApiResponse {
	triggeredDagInfo?: IDagRun
}

export interface IGetDagRunStatusResponse extends IApiResponse {
	dagStatus?: IDagRun
}
