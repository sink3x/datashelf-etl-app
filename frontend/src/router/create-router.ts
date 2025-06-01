import { createBrowserRouter } from 'react-router-dom'

import { Routes } from './routes'

const routerList = Object.values(Routes).map((routerObject) => ({
	path: routerObject.path,
	element: routerObject.element,
}))

export const router = createBrowserRouter(routerList)
