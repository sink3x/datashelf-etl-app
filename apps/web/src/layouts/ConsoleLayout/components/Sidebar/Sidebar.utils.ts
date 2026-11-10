import { ERoutesPageNames, Routes } from '@router/routes'
import { ERouterElementType } from '@router/routes.interfaces'

import type { IAppConfig } from '@shared/config/config.interface'

import { getSupportNavItems } from './Sidebar.constants'

import type { ISidebarNavGroup, ISidebarNavItem } from './Sidebar.interfaces'

const DASHBOARD_PATH_PREFIX = '/console/dashboard'

export const getNavigationGroups = (urls: IAppConfig['urls']): ISidebarNavGroup[] => {
	const consoleChildren = Routes[ERoutesPageNames.CONSOLE]!.children!
	const groups = new Map<string, ISidebarNavItem[]>()

	Object.entries(consoleChildren).forEach(([key, element]) => {
		if (element.type === ERouterElementType.ABSTRACT || !element.group || !element.fullPath) {
			return
		}

		const item: ISidebarNavItem = {
			key,
			name: element.name ?? key,
			icon: element.icon,
			to: element.fullPath,
			...(key === ERoutesPageNames.CONSOLE_FILES ? { matchPaths: [DASHBOARD_PATH_PREFIX] } : {}),
		}

		groups.set(element.group, [...(groups.get(element.group) ?? []), item])
	})

	const supportItems = getSupportNavItems(urls)

	if (supportItems.length) {
		groups.set('Support', [...(groups.get('Support') ?? []), ...supportItems])
	}

	return [...groups.entries()].map(([name, items]) => ({ name, items }))
}

export const isNavItemActive = (item: ISidebarNavItem, pathname: string, consoleRootPath: string) => {
	if (item.isExternal) {
		return false
	}

	if (item.to === consoleRootPath) {
		return pathname === consoleRootPath || pathname === `${consoleRootPath}/`
	}

	return [item.to, ...(item.matchPaths ?? [])].some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	)
}
