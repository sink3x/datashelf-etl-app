import type { IObjectAny } from '@interfaces/object-any'

import type { AxiosError } from 'axios'

export interface IAxiosErrorReponseBaseInfo extends IObjectAny {
	detail: string
}

export interface IAxiosErrorResponseBase
	extends AxiosError<{
		message: string
		info?: IAxiosErrorReponseBaseInfo
	}> {}
