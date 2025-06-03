import axios from 'axios'

import { APP_CONFIG } from '@shared/config/config'

const { services } = APP_CONFIG

export const axiosInstance = axios.create({
	baseURL: services.apiUrl,
})
