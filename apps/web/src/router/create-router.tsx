import { createBrowserRouter } from 'react-router-dom'

import { ErrorBoundaryLayout } from '@layouts/ErrorBoundaryLayout/ErrorBoundaryLayout'

import { Routes } from './routes'
import { ERouterElementType, type IRouteNode } from './routes.interfaces'

// TODO: make recursive
const routerList = Object.values(Routes).map((__routerObject) => {
	const routerObject = __routerObject as IRouteNode

	if (routerObject?.type === ERouterElementType.GROUP) {
		const childrenRoutes = Object.values(routerObject.children!).map((routerObjectChild) => ({
			path: `${routerObject.path}${routerObjectChild.path}`,
			handle: { title: routerObjectChild.name },
			element: routerObjectChild.element,
		}))

		return {
			element: <ErrorBoundaryLayout>{routerObject.element}</ErrorBoundaryLayout>,
			children: childrenRoutes,
		}
	}

	return {
		path: routerObject.path,
		element: <ErrorBoundaryLayout>{routerObject.element}</ErrorBoundaryLayout>,
	}
})

export const router = createBrowserRouter(routerList)
