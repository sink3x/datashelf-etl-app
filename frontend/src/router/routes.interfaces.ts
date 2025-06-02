import type { ReactNode } from 'react'

import type { ERoutesPageNames } from './routes'

export const enum ERouterElementType {
	ABSTRACT = 'ABSTRACT',
	GROUP = 'GROUP',
	PAGE = 'PAGE',
}

export interface IRouterElement {
	path: string
	fullPath?: string
	element?: ReactNode
	icon?: ReactNode
	type?: ERouterElementType
	group?: string
	name?: string
}

export interface IRouteNode extends IRouterElement {
	children?: Partial<Record<ERoutesPageNames, IRouterElement>>
}

export interface IRoutes extends Partial<Record<ERoutesPageNames, IRouteNode>> {}
