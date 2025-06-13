import { axiosInstance } from '@lib/axios/axios-instance'

import { DATASET_BASE } from './dataset-service.constants'

import type {
	IGetChartsParams,
	IGetChartsRequest,
	IGetChartsResponse,
	IGetRawFileListParams,
	IGetRawFileListRequest,
	IGetRawFileListResponse,
} from './dataset-service.interfaces'

export const getRawFileList = (params: IGetRawFileListParams) =>
	axiosInstance<IGetRawFileListResponse, IGetRawFileListRequest>(`${DATASET_BASE}/raw`, {
		params,
	})

export const getCharts = (params: IGetChartsParams) => {
	const { fileName } = params

	return axiosInstance<IGetChartsResponse, IGetChartsRequest>(`${DATASET_BASE}/charts/${fileName}`, {
		params,
	})
}
