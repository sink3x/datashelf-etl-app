import { RouterProvider } from 'react-router-dom'

import { StrictModeWrapper } from '@components/StrictModeWrapper/StrictModeWrapper'
import { GlobalStyles } from '@styles/global/GlobalStyles'

import { router } from './router/create-router'

export const App = () => {
	return (
		<StrictModeWrapper>
			<GlobalStyles />
			<RouterProvider router={router} />
		</StrictModeWrapper>
	)
}
