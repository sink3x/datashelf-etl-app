import { axiosInstance } from '@lib/axios/axios-instance'

import { AIRFLOW_BASE } from './airflow-service.constants'

import type {
	IUploadRawDataRequest,
	IUploadRawDataResponse,
	TUploadRawDataService,
} from './airflow-service.interfaces'

export const uploadRawData: TUploadRawDataService = (payload, params) =>
	axiosInstance.post<IUploadRawDataRequest, IUploadRawDataResponse>(`${AIRFLOW_BASE}/process-data`, payload, {
		...params,
	})
