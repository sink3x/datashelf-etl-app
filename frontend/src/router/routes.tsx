import { ChartPie, CodeCommits, Files, FolderArrowUpIn, Gear, House } from '@gravity-ui/icons'

import { ConsoleLayout } from '@layouts/ConsoleLayout/ConsoleLayout'
import { HomePage } from '@pages/Console/HomePage/HomePage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { WelcomePage } from '@pages/WelcomePage/WelcomePage'

import { ERouterElementType, type IRoutes } from './routes.interfaces'

export const enum ERoutesPageNames {
	WELCOME = 'WELCOME',
	NOT_FOUND = 'NOT_FOUND',
	CONSOLE = 'CONSOLE',
	CONSOLE_HOME = 'CONSOLE_HOME',
	CONSOLE_NOT_FOUND = 'CONSOLE_NOT_FOUND',
	CONSOLE_FILES = 'CONSOLE_FILES',
	CONSOLE_UPLOAD = 'CONSOLE_UPLOAD',
	CONSOLE_PIPELINES = 'CONSOLE_PIPELINES',
	CONSOLE_DASHBOARDS = 'CONSOLE_DASHBOARDS',
	CONSOLE_SETTIGS = 'CONSOLE_SETTINGS',
}

// TODO: separate, each group in own object
export const Routes: IRoutes = {
	[ERoutesPageNames.WELCOME]: {
		path: '/',
		element: <WelcomePage />,
		icon: null,
	},
	[ERoutesPageNames.NOT_FOUND]: {
		path: '*',
		element: <NotFoundPage />,
		type: ERouterElementType.ABSTRACT,
	},
	[ERoutesPageNames.CONSOLE]: {
		path: '/console',
		element: <ConsoleLayout />,
		type: ERouterElementType.GROUP,
		children: {
			[ERoutesPageNames.CONSOLE_HOME]: {
				path: '/',
				fullPath: '/console',
				element: <HomePage />,
				icon: <House />,
				group: 'General',
				name: 'Home',
			},
			[ERoutesPageNames.CONSOLE_FILES]: {
				path: '/storage',
				fullPath: '/console/storage',
				element: <div> files </div>,
				icon: <Files />,
				group: 'General',
				name: 'Storage',
			},
			[ERoutesPageNames.CONSOLE_UPLOAD]: {
				path: '/upload',
				fullPath: '/console/upload',
				element: <div> upload </div>,
				icon: <FolderArrowUpIn />,
				group: 'General',
				name: 'Upload',
			},
			[ERoutesPageNames.CONSOLE_PIPELINES]: {
				path: '/pipelines',
				fullPath: '/console/pipelines',
				element: <div> pipelines </div>,
				icon: <CodeCommits />,
				group: 'General',
				name: 'Pipelines',
			},
			[ERoutesPageNames.CONSOLE_DASHBOARDS]: {
				path: '/dashboard',
				fullPath: '/console/dashboard',
				element: <div> dashboards </div>,
				icon: <ChartPie />,
				group: 'General',
				name: 'Dashboard',
			},
			[ERoutesPageNames.CONSOLE_SETTIGS]: {
				path: '/settings',
				fullPath: '/console/settings',
				element: <div> settigns </div>,
				icon: <Gear />,
				group: 'Support',
				name: 'Settings',
			},
			[ERoutesPageNames.NOT_FOUND]: {
				path: '*',
				element: <div> Nope </div>,
				icon: null,
				type: ERouterElementType.ABSTRACT,
			},
		},
	},
}
