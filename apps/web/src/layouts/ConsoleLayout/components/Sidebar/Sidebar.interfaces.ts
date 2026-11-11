import type { ReactNode } from 'react'

export interface ISidebarProps {
	isMobileOpen: boolean
	onMobileClose: () => void
}

export interface ISidebarNavItem {
	key: string
	name: string
	icon: ReactNode
	to: string
	isExternal?: boolean
	matchPaths?: string[]
}

export interface ISidebarNavGroup {
	name: string
	items: ISidebarNavItem[]
}
