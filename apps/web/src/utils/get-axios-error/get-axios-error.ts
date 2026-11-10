import { SERVICE_UNVAILABLE_MESSAGE } from './get-axios.error.constants'

import type { IAxiosErrorResponseBase } from './get-axios-error.interfaces'

export const getAxiosError = (error: unknown) => {
	const axiosError = (error as IAxiosErrorResponseBase)?.response?.data
	const { message, info } = axiosError || {}

	return info?.detail || message || SERVICE_UNVAILABLE_MESSAGE
}
