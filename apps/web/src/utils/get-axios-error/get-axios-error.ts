import { isAxiosError } from 'axios'

import { i18n } from '@shared/i18n/i18n'

import type { IApiErrorBody } from './get-axios-error.interfaces'

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

export const getAxiosError = (error: unknown): string => {
	if (isAxiosError<IApiErrorBody>(error)) {
		if (!error.response) {
			return i18n.t('errors.serviceUnavailable')
		}

		const body = error.response.data

		return (
			asText(body?.info?.detail) ??
			asText(body?.message) ??
			i18n.t('errors.apiStatus', { status: error.response.status })
		)
	}

	if (error instanceof Error) {
		return asText(error.message) ?? i18n.t('errors.unknown')
	}

	return i18n.t('errors.unknown')
}
