import { axiosInstance } from '@lib/axios/axios-instance'

import type {
	IGetRawFileListParams,
	IGetRawFileListRequest,
	IGetRawFileListResponse,
} from './dataset-service.interfaces'

export const getRawFileList = (params: IGetRawFileListParams) =>
	axiosInstance<IGetRawFileListRequest, IGetRawFileListResponse>('/api/dataset/raw', {
		params,
	})
