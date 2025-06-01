import { HomePage } from '@pages/HomePage/HomePage'

export const enum ERoutesPageNames {
	HOME = 'HOME',
	NOT_FOUND = 'NOT_FOUND',
}

export const Routes = {
	[ERoutesPageNames.HOME]: {
		path: '/',
		element: <HomePage />,
		icon: null,
	},
	[ERoutesPageNames.NOT_FOUND]: {
		path: '*',
		elemnt: null,
	},
}
