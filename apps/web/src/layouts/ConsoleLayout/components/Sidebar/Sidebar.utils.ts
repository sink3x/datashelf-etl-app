import { ERoutesPageNames, ROUTE_PATHS } from '@router/paths'
import { Routes } from '@router/routes'
import { ERouterElementType, type TNavGroupId } from '@router/routes.interfaces'

import type { IAppConfig } from '@shared/config/config.interface'

import { getSupportNavItems } from './Sidebar.constants'

import type { ISidebarNavGroup, ISidebarNavItem } from './Sidebar.interfaces'

export const getNavigationGroups = (urls: IAppConfig['urls']): ISidebarNavGroup[] => {
	const consoleChildren = Routes[ERoutesPageNames.CONSOLE]!.children!
	const groups = new Map<TNavGroupId, ISidebarNavItem[]>()

	Object.entries(consoleChildren).forEach(([key, element]) => {
		if (
			element.type === ERouterElementType.ABSTRACT ||
			!element.group ||
			!element.name ||
			!element.fullPath
		) {
			return
		}

		const item: ISidebarNavItem = {
			key,
			name: element.name,
			icon: element.icon,
			to: element.fullPath,
			...(key === ERoutesPageNames.CONSOLE_FILES ? { matchPaths: [ROUTE_PATHS.CONSOLE_DASHBOARD] } : {}),
		}

		groups.set(element.group, [...(groups.get(element.group) ?? []), item])
	})

	const supportItems = getSupportNavItems(urls)

	if (supportItems.length) {
		groups.set('support', [...(groups.get('support') ?? []), ...supportItems])
	}

	return [...groups.entries()].map(([id, items]) => ({ id, items }))
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
