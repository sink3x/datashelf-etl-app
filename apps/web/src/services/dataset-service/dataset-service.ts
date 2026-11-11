import { axiosInstance } from '@lib/axios/axios-instance'

import { DATASET_ROUTES } from './dataset-service.constants'

import type {
	IGetChartsResponse,
	IGetProcessedDatasetListResponse,
	IGetRawFileListParams,
	IGetRawFileListResponse,
} from './dataset-service.interfaces'

export const getRawFileList = async (params: IGetRawFileListParams) => {
	const { data } = await axiosInstance.get<IGetRawFileListResponse>(DATASET_ROUTES.raw, { params })

	return data
}

export const getProcessedDatasetList = async () => {
	const { data } = await axiosInstance.get<IGetProcessedDatasetListResponse>(DATASET_ROUTES.processed)

	return data
}

export const getCharts = async (filename: string) => {
	const { data } = await axiosInstance.get<IGetChartsResponse>(DATASET_ROUTES.charts(filename))

	return data
}
