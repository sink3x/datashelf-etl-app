import { parseAppConfig, type TParseAppConfigResult } from './config.schema'

import type { IAppConfig } from './config.interface'

let appConfig: IAppConfig | null = null

export const initAppConfig = (rawConfig: unknown): TParseAppConfigResult => {
	const result = parseAppConfig(rawConfig)

	appConfig = result.success ? result.config : null

	return result
}

export const getAppConfig = (): IAppConfig => {
	if (!appConfig) {
		throw new Error('Runtime config is not initialized: call initAppConfig() before rendering the app')
	}

	return appConfig
}
