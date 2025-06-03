import type { HTMLAttributes } from 'react'

export interface ISidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface ISidebarGroupProps {
	$groupIndex: number
}

export interface ISiderbarGroupItemProps {
	$isActive?: boolean
}
