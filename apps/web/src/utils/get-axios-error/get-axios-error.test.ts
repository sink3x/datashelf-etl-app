import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getAxiosError } from './get-axios-error'

const responseError = (status: number, data: unknown) =>
	new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
		status,
		statusText: '',
		headers: {},
		config: { headers: new AxiosHeaders() },
		data,
	})

describe('getAxiosError', () => {
	it('prefers the airflow detail over the api message', () => {
		expect(getAxiosError(responseError(500, { message: 'Failed', info: { detail: 'DAG not found' } }))).toBe(
			'DAG not found',
		)
	})

	it('uses the api message', () => {
		expect(getAxiosError(responseError(400, { message: 'Dag ID not provided', code: 'BAD_REQUEST' }))).toBe(
			'Dag ID not provided',
		)
	})

	it('falls back to the status code when the body is empty', () => {
		expect(getAxiosError(responseError(502, ''))).toBe('The API responded with status 502.')
	})

	it('reports network failures as an unavailable api', () => {
		expect(getAxiosError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(
			'The API is unavailable. Check that it is running and try again.',
		)
	})

	it('handles plain errors and unknown values', () => {
		expect(getAxiosError(new Error('Boom'))).toBe('Boom')
		expect(getAxiosError('nope')).toBe('Something went wrong. Try again.')
	})
})
