import { ERoutesPageNames, Routes } from '@router/routes'
import { ERouterElementType, type IRouterElement } from '@router/routes.interfaces'

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
