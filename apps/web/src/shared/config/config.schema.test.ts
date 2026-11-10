import { describe, expect, it } from 'vitest'

import { DEFAULT_DAG_ID, DEFAULT_GEOGRAPHY_ATLAS_URL, parseAppConfig } from './config.schema'

describe('parseAppConfig', () => {
	it('accepts a full config and keeps its values', () => {
		const result = parseAppConfig({
			services: { apiUrl: 'https://api.example.com/' },
			urls: {
				contactUsUrl: 'https://example.com/contact',
				documentationUrl: 'https://api.example.com/docs',
				geographyAtlasUrl: 'https://cdn.example.com/states.json',
			},
			vars: { defaultDagId: 'retail_etl' },
		})

		expect(result).toEqual({
			success: true,
			config: {
				services: { apiUrl: 'https://api.example.com' },
				urls: {
					contactUsUrl: 'https://example.com/contact',
					documentationUrl: 'https://api.example.com/docs',
					geographyAtlasUrl: 'https://cdn.example.com/states.json',
				},
				vars: { defaultDagId: 'retail_etl' },
			},
		})
	})

	it('fills optional sections with defaults and allows a same-origin api url', () => {
		const result = parseAppConfig({ services: { apiUrl: '' } })

		expect(result).toEqual({
			success: true,
			config: {
				services: { apiUrl: '' },
				urls: { contactUsUrl: '', documentationUrl: '', geographyAtlasUrl: DEFAULT_GEOGRAPHY_ATLAS_URL },
				vars: { defaultDagId: DEFAULT_DAG_ID },
			},
		})
	})

	it('reports every invalid field with its path', () => {
		const result = parseAppConfig({
			services: { apiUrl: 'not a url' },
			urls: { documentationUrl: 'ftp://example.com' },
			vars: { defaultDagId: '   ' },
		})

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.issues.map((issue) => issue.path)).toEqual([
				'window.appConfig.services.apiUrl',
				'window.appConfig.urls.documentationUrl',
				'window.appConfig.vars.defaultDagId',
			])
		}
	})

	it('explains a missing config object', () => {
		const result = parseAppConfig(undefined)

		expect(result.success).toBe(false)

		if (!result.success) {
			expect(result.issues[0]?.message).toMatch(/app-config\.js/)
		}
	})
})
