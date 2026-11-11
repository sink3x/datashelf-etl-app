import type { ReactNode } from 'react'

import type { TNavGroupId, TNavKey } from '@router/routes.interfaces'

export interface ISidebarProps {
	isMobileOpen: boolean
	onMobileClose: () => void
}

export interface ISidebarNavItem {
	key: string
	name: TNavKey
	icon: ReactNode
	to: string
	isExternal?: boolean
	matchPaths?: string[]
}

export interface ISidebarNavGroup {
	id: TNavGroupId
	items: ISidebarNavItem[]
}
