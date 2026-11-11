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
}

export const ROUTE_PATHS = {
	WELCOME: '/',
	CONSOLE: '/console',
	CONSOLE_FILES: '/console/storage',
	CONSOLE_UPLOAD: '/console/upload',
	CONSOLE_PIPELINES: '/console/pipelines',
	CONSOLE_DASHBOARD: '/console/dashboard',
} as const

export const getDashboardPath = (filename: string) =>
	`${ROUTE_PATHS.CONSOLE_DASHBOARD}/${encodeURIComponent(filename)}`
