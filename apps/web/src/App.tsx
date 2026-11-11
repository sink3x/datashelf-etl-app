import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'

import { router } from '@router/create-router'

import { StrictModeWrapper } from '@components/StrictModeWrapper/StrictModeWrapper'
import { GlobalStyles } from '@styles/global/GlobalStyles'
import { antdTheme } from '@styles/theme'

export const App = () => {
	return (
		<StrictModeWrapper>
			<ConfigProvider theme={antdTheme}>
				<GlobalStyles />
				<RouterProvider router={router} />
			</ConfigProvider>
		</StrictModeWrapper>
	)
}
