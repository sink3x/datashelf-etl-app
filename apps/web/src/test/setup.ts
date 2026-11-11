import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { initAppConfig } from '@shared/config/config'
import { i18n } from '@shared/i18n/i18n'
import { DEFAULT_LANGUAGE } from '@shared/i18n/i18n.constants'

import { resetMockDb } from '../mocks/db'
import { mockServer } from '../mocks/node'

import { TEST_APP_CONFIG } from './test-config'

window.appConfig = TEST_APP_CONFIG
initAppConfig(window.appConfig)

if (!window.matchMedia) {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	})
}

if (!window.ResizeObserver) {
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }))

afterEach(async () => {
	cleanup()
	mockServer.resetHandlers()
	resetMockDb()
	await i18n.changeLanguage(DEFAULT_LANGUAGE)
	window.localStorage.clear()
})

afterAll(() => mockServer.close())
