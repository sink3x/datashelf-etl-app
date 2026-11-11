import { createRoot } from 'react-dom/client'

import { ConfigErrorScreen } from '@components/ConfigErrorScreen/ConfigErrorScreen'
import { initAppConfig } from '@shared/config/config'
import { IS_API_MOCK } from '@shared/constants'
import { i18n } from '@shared/i18n/i18n'

const bootstrap = async () => {
	const root = createRoot(document.getElementById('root')!)
	const configResult = initAppConfig(window.appConfig)

	if (!configResult.success) {
		root.render(<ConfigErrorScreen issues={configResult.issues} />)
		return
	}

	if (IS_API_MOCK) {
		try {
			const { startMockApi } = await import('./mocks/browser')

			await startMockApi()
		} catch (error) {
			root.render(
				<ConfigErrorScreen
					title={i18n.t('configError.demoTitle')}
					description={i18n.t('configError.demoDescription')}
					issues={[
						{ path: 'mockServiceWorker.js', message: error instanceof Error ? error.message : String(error) },
					]}
				/>,
			)
			return
		}
	}

	const { App } = await import('./App')

	root.render(<App />)
}

void bootstrap()
