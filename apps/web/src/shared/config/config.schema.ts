import { z } from 'zod'

export const DEFAULT_GEOGRAPHY_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
export const DEFAULT_DAG_ID = 'customer_data_etl'

const optionalUrl = z.union([z.literal(''), z.url({ protocol: /^https?$/ })])

export const appConfigSchema = z.object({
	services: z.object({
		apiUrl: optionalUrl.transform((value) => value.replace(/\/+$/, '')),
	}),
	urls: z
		.object({
			contactUsUrl: optionalUrl.default(''),
			documentationUrl: optionalUrl.default(''),
			geographyAtlasUrl: z.url().default(DEFAULT_GEOGRAPHY_ATLAS_URL),
		})
		.prefault({}),
	vars: z
		.object({
			defaultDagId: z.string().trim().min(1).default(DEFAULT_DAG_ID),
		})
		.prefault({}),
})

export interface IAppConfigIssue {
	path: string
	message: string
}

export type TParseAppConfigResult =
	| { success: true; config: z.infer<typeof appConfigSchema> }
	| { success: false; issues: IAppConfigIssue[] }

export const parseAppConfig = (rawConfig: unknown): TParseAppConfigResult => {
	if (rawConfig === undefined || rawConfig === null) {
		return {
			success: false,
			issues: [{ path: 'window.appConfig', message: 'Runtime config is missing. Is app-config.js loaded?' }],
		}
	}

	const result = appConfigSchema.safeParse(rawConfig)

	if (result.success) {
		return { success: true, config: result.data }
	}

	return {
		success: false,
		issues: result.error.issues.map((issue) => ({
			path: ['window.appConfig', ...issue.path.map(String)].join('.'),
			message: issue.message,
		})),
	}
}
