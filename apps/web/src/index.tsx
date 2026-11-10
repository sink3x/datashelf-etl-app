import { createRoot } from 'react-dom/client'

import { ConfigErrorScreen } from '@components/ConfigErrorScreen/ConfigErrorScreen'
import { initAppConfig } from '@shared/config/config'

const bootstrap = async () => {
	const root = createRoot(document.getElementById('root')!)
	const configResult = initAppConfig(window.appConfig)

	if (!configResult.success) {
		root.render(<ConfigErrorScreen issues={configResult.issues} />)
		return
	}

	const { App } = await import('./App')

	root.render(<App />)
}

void bootstrap()
