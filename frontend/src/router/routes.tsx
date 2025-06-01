import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { WelcomePage } from '@pages/WelcomePage/WelcomePage'

import type { IRoutes } from './routes.interfaces'

export const enum ERoutesPageNames {
	HOME = 'HOME',
	NOT_FOUND = 'NOT_FOUND',
}

export const Routes: IRoutes = {
	[ERoutesPageNames.HOME]: {
		path: '/',
		element: <WelcomePage />,
		icon: null,
	},
	[ERoutesPageNames.NOT_FOUND]: {
		path: '*',
		element: <NotFoundPage />,
	},
}
