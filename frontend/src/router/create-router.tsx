import { createBrowserRouter } from 'react-router-dom'

import { ErrorBoundaryLayout } from '@layouts/ErrorBoundaryLayout/ErrorBoundaryLayout'

import { Routes } from './routes'

import type { IRoutePage } from './routes.interfaces'

const routerList = Object.values(Routes).map((__routerObject) => {
	const routerObject = __routerObject as IRoutePage

	return {
		path: routerObject.path,
		element: <ErrorBoundaryLayout>{routerObject.element}</ErrorBoundaryLayout>,
	}
})

export const router = createBrowserRouter(routerList)
