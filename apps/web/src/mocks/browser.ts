import { setupWorker } from 'msw/browser'

import { enableMockPersistence } from './db'
import { handlers } from './handlers'

export const startMockApi = async () => {
	enableMockPersistence()

	await setupWorker(...handlers).start({
		serviceWorker: {
			url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
			options: { scope: import.meta.env.BASE_URL },
		},
		onUnhandledRequest: 'bypass',
		quiet: true,
	})
}
