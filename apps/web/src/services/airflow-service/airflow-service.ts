import { axiosInstance } from '@lib/axios/axios-instance'

import { AIRFLOW_ROUTES, UPLOAD_DAG_ID_FIELD, UPLOAD_FILE_FIELD } from './airflow-service.constants'

import type {
	IGetAllowedFileTypesResponse,
	IGetDagListResponse,
	IGetDagRunStatusResponse,
	IUploadRawDataParams,
	IUploadRawDataResponse,
} from './airflow-service.interfaces'

export const getDagList = async () => {
	const { data } = await axiosInstance.get<IGetDagListResponse>(AIRFLOW_ROUTES.dags)

	return data
}

export const getAllowedFileTypes = async () => {
	const { data } = await axiosInstance.get<IGetAllowedFileTypesResponse>(AIRFLOW_ROUTES.allowedFileTypes)

	return data
}

export const uploadRawData = async (params: IUploadRawDataParams) => {
	const { file, dagId, onProgress } = params
	const formData = new FormData()

	formData.append(UPLOAD_FILE_FIELD, file)
	formData.append(UPLOAD_DAG_ID_FIELD, dagId)

	const { data } = await axiosInstance.post<IUploadRawDataResponse>(AIRFLOW_ROUTES.processData, formData, {
		onUploadProgress: (event) => {
			if (onProgress && event.total) {
				onProgress(Math.round((event.loaded / event.total) * 100))
			}
		},
	})

	return data
}

export const getDagRunStatus = async (dagId: string, dagRunId: string) => {
	const { data } = await axiosInstance.get<IGetDagRunStatusResponse>(
		AIRFLOW_ROUTES.dagRunStatus(dagId, dagRunId),
	)

	return data
}
