import packageJson from '../../package.json'

export const APP_MODE = String(process.env.NODE_ENV)

export const isProduction = APP_MODE === 'production'
export const isDevelopment = APP_MODE === 'development'

export const BACKEND_VERSION = packageJson.version
