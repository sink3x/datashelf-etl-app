import axios from 'axios'
import axiosRetry from 'axios-retry'

import { APP_CONFIG } from '@shared/config/config'

const { services } = APP_CONFIG

export const axiosInstance = axios.create({
	baseURL: services.apiUrl,
})

axiosRetry(axiosInstance, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: (error) => {
		const status = error?.response?.status
		return (
			axiosRetry.isNetworkOrIdempotentRequestError(error) ||
			(status != null && status >= 500 && status <= 599)
		)
	},
})
