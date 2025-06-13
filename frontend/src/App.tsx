import { Layout } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { router } from '@router/create-router'

import { StrictModeWrapper } from '@components/StrictModeWrapper/StrictModeWrapper'
import { GlobalStyles } from '@styles/global/GlobalStyles'

import 'react-toastify/dist/ReactToastify.css'

export const App = () => {
	return (
		<StrictModeWrapper>
			<GlobalStyles />
			<Layout>
				<ToastContainer position="bottom-right" pauseOnFocusLoss />
				<RouterProvider router={router} />
			</Layout>
		</StrictModeWrapper>
	)
}
