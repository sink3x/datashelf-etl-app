import axios from 'axios'
import axiosRetry from 'axios-retry'

import { getAppConfig } from '@shared/config/config'

const { services } = getAppConfig()

export const axiosInstance = axios.create({
	baseURL: services.apiUrl,
})

axiosRetry(axiosInstance, {
	retries: import.meta.env.MODE === 'test' ? 0 : 3,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: axiosRetry.isNetworkOrIdempotentRequestError,
})
