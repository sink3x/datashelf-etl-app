import type { IDagInfo } from '@interfaces/dag'
import type { IObjectAny } from '@interfaces/object-any'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export type TUploadRawDataPayload = FormData
export type TUploadRawDataParams = {}

export interface IUploadRawDataResponse
	extends AxiosResponse<{
		message: string
		triggeredDagInfo: IDagInfo
		info?: IObjectAny
	}> {}

export interface IUploadRawDataRequest extends AxiosRequestConfig<TUploadRawDataPayload> {}

export type TUploadRawDataService = (
	payload: TUploadRawDataPayload,
	params: TUploadRawDataParams,
) => Promise<IUploadRawDataResponse>
