import { ChartPie, Files, FolderArrowUpIn, House, Pipeline } from '@gravity-ui/icons'

import { ConsoleLayout } from '@layouts/ConsoleLayout/ConsoleLayout'
import { DashboardPage } from '@pages/Console/DashboardPage/DashboardPage'
import { HomePage } from '@pages/Console/HomePage/HomePage'
import { NotFoundPage as ConsoleNotFoundPage } from '@pages/Console/NotFoundPage/NotFoundPage'
import { PipelinesPage } from '@pages/Console/PipelinesPage/PipelinesPage'
import { StoragePage } from '@pages/Console/StoragePage/StoragePage'
import { UploadPage } from '@pages/Console/UploadPage/UploadPage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { WelcomePage } from '@pages/WelcomePage/WelcomePage'

import { ERoutesPageNames, getDashboardPath, ROUTE_PATHS } from './paths'
import { ERouterElementType, type IRoutes } from './routes.interfaces'

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
				fullPath: ROUTE_PATHS.CONSOLE,
				element: <HomePage />,
				icon: <House />,
				group: 'general',
				name: 'nav.home',
			},
			[ERoutesPageNames.CONSOLE_FILES]: {
				path: '/storage',
				fullPath: ROUTE_PATHS.CONSOLE_FILES,
				element: <StoragePage />,
				icon: <Files />,
				group: 'general',
				name: 'nav.storage',
			},
			[ERoutesPageNames.CONSOLE_UPLOAD]: {
				path: '/upload',
				fullPath: ROUTE_PATHS.CONSOLE_UPLOAD,
				element: <UploadPage />,
				icon: <FolderArrowUpIn />,
				group: 'general',
				name: 'nav.upload',
			},
			[ERoutesPageNames.CONSOLE_PIPELINES]: {
				path: '/pipelines',
				fullPath: ROUTE_PATHS.CONSOLE_PIPELINES,
				element: <PipelinesPage />,
				icon: <Pipeline />,
				group: 'general',
				name: 'nav.pipelines',
			},
			[ERoutesPageNames.CONSOLE_DASHBOARD]: {
				path: '/dashboard',
				fullPath: ROUTE_PATHS.CONSOLE_DASHBOARD,
				element: <DashboardPage />,
				icon: <ChartPie />,
				type: ERouterElementType.ABSTRACT,
				group: 'general',
				name: 'nav.dashboard',
			},
			[ERoutesPageNames.CONSOLE_DASHBOARD_BY_FILENAME]: {
				path: '/dashboard/:filename',
				fullPath: '/console/dashboard/:filename',
				element: <DashboardPage />,
				group: 'general',
				name: 'nav.dashboard',
				type: ERouterElementType.ABSTRACT,
				getFullPathDynamic: getDashboardPath,
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
