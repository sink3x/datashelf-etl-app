import { Layout } from 'antd'
import { RouterProvider } from 'react-router-dom'

import { router } from '@router/create-router'

import { StrictModeWrapper } from '@components/StrictModeWrapper/StrictModeWrapper'
import { GlobalStyles } from '@styles/global/GlobalStyles'

export const App = () => {
	return (
		<StrictModeWrapper>
			<GlobalStyles />
			<Layout>
				<RouterProvider router={router} />
			</Layout>
		</StrictModeWrapper>
	)
}
