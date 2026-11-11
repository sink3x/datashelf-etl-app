import type { IApiResponse } from '@interfaces/api-response'
import type { TChartsByName } from '@interfaces/chart'
import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { IRawFile } from '@interfaces/file-raw'

export interface IGetRawFileListParams {
	page: number
	limit: number
}

export interface IGetRawFileListResponse extends IApiResponse {
	datasetList?: IRawFile[]
}

export interface IGetProcessedDatasetListResponse extends IApiResponse {
	datasetList?: IDatasetProcessed[]
}

export interface IGetChartsResponse extends IApiResponse {
	charts?: TChartsByName
}
