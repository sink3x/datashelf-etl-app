import { isAxiosError } from 'axios'

import { SERVICE_UNAVAILABLE_MESSAGE, UNKNOWN_ERROR_MESSAGE } from './get-axios.error.constants'

import type { IApiErrorBody } from './get-axios-error.interfaces'

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

export const getAxiosError = (error: unknown): string => {
	if (isAxiosError<IApiErrorBody>(error)) {
		if (!error.response) {
			return SERVICE_UNAVAILABLE_MESSAGE
		}

		const body = error.response.data

		return (
			asText(body?.info?.detail) ??
			asText(body?.message) ??
			`The API responded with status ${error.response.status}.`
		)
	}

	if (error instanceof Error) {
		return asText(error.message) ?? UNKNOWN_ERROR_MESSAGE
	}

	return UNKNOWN_ERROR_MESSAGE
}
