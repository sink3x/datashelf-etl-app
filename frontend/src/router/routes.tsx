import { ChartPie, CodeCommits, Files, FolderArrowUpIn, Gear, House } from '@gravity-ui/icons'

// TODO: use lazy load
import { ConsoleLayout } from '@layouts/ConsoleLayout/ConsoleLayout'
import { DashboardPage } from '@pages/Console/DashboardPage/DashboardPage'
import { HomePage } from '@pages/Console/HomePage/HomePage'
import { NotFoundPage as ConsoleNotFoundPage } from '@pages/Console/NotFoundPage/NotFoundPage'
import { PipelinesPage } from '@pages/Console/PipelinesPage/PipelinesPage'
import { StoragePage } from '@pages/Console/StoragePage/StoragePage'
import { UploadPage } from '@pages/Console/UploadPage/UploadPage'
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
	CONSOLE_DASHBOARD = 'CONSOLE_DASHBOARD',
	CONSOLE_DASHBOARD_BY_FILENAME = 'CONSOLE_DASHBOARD_BY_FILENAME',
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
		path: '/*',
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
				element: <StoragePage />,
				icon: <Files />,
				group: 'General',
				name: 'Storage',
			},
			[ERoutesPageNames.CONSOLE_UPLOAD]: {
				path: '/upload',
				fullPath: '/console/upload',
				element: <UploadPage />,
				icon: <FolderArrowUpIn />,
				group: 'General',
				name: 'Upload',
			},
			[ERoutesPageNames.CONSOLE_PIPELINES]: {
				path: '/pipelines',
				fullPath: '/console/pipelines',
				element: <PipelinesPage />,
				icon: <CodeCommits />,
				group: 'General',
				name: 'Pipelines',
				isDisabled: true,
			},
			[ERoutesPageNames.CONSOLE_DASHBOARD]: {
				path: '/dashboard',
				fullPath: '/console/dashboard',
				element: <DashboardPage />,
				icon: <ChartPie />,
				type: ERouterElementType.ABSTRACT,
				group: 'General',
				name: 'Dashboard',
			},
			[ERoutesPageNames.CONSOLE_DASHBOARD_BY_FILENAME]: {
				path: '/dashboard/:filename',
				fullPath: '/console/dashboard/:filename',
				element: <DashboardPage />,
				group: 'General',
				name: 'Dashboard',
				type: ERouterElementType.ABSTRACT,
				getFullPathDynamic: (fileName: string) => `/console/dashboard/${fileName}`,
			},
			[ERoutesPageNames.CONSOLE_SETTIGS]: {
				path: '/settings',
				fullPath: '/console/settings',
				element: <div> settigns </div>,
				icon: <Gear />,
				group: 'Support',
				name: 'Settings',
				isDisabled: true,
			},
			[ERoutesPageNames.NOT_FOUND]: {
				path: '/*',
				element: <ConsoleNotFoundPage />,
				icon: null,
				type: ERouterElementType.ABSTRACT,
			},
		},
	},
}
