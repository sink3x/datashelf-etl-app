import { ERoutesPageNames, Routes } from '@router/routes'
import { ERouterElementType, type IRouterElement } from '@router/routes.interfaces'

import { EXTENTED_SUPPORT_GROUP } from './Sidebar.constants'

export const getNavigationElementsInGroups = () => {
	const CONSOLE_NAVIGATION_ELEMENT_LIST = Object.values(Routes[ERoutesPageNames.CONSOLE]!.children!)

	const navigationElementsInGroup: Record<string, IRouterElement[]> = {}

	CONSOLE_NAVIGATION_ELEMENT_LIST.forEach((element) => {
		if (element.type === ERouterElementType.ABSTRACT) {
			return
		}

		navigationElementsInGroup[element.group!] = [
			...(navigationElementsInGroup[element.group!] || []),
			element,
		]
	})

	return navigationElementsInGroup
}

export const getExtenedNavigationElementsInGroups = (elementsInGroups: Record<string, IRouterElement[]>) => {
	elementsInGroups['Support'] = [...EXTENTED_SUPPORT_GROUP, ...(elementsInGroups?.['Support'] || [])]

	return elementsInGroups
}
