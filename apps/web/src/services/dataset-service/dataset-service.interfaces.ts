import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { IRawFile } from '@interfaces/file-raw'
import type { IObjectAny } from '@interfaces/object-any'
import type { IResponseMeta } from '@interfaces/response-meta'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface IGetRawFileListParams {
	page: number
	limit: number
}

export interface IGetRawFileListRequest
	extends AxiosRequestConfig<{
		params: {
			page: number
			limit: number
		}
	}> {}

export interface IGetRawFileListResponse
	extends AxiosResponse<{
		message: string
		datasetList?: IRawFile[]
		info?: IObjectAny
		meta?: IResponseMeta
	}> {}

export interface IGetChartsParams {
	fileName: string
}

export interface IGetChartsRequest
	extends AxiosRequestConfig<{
		params: {}
	}> {}

export interface IGetChartsResponse
	extends AxiosResponse<{
		message: string
		charts?: Record<string, IDatasetProcessed['chart'][]>
		info?: IObjectAny
		meta?: IResponseMeta
	}> {}
