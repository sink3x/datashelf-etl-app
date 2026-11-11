import type { ReactNode } from 'react'

import type { TTranslationResources } from '@shared/i18n/i18n.interfaces'

import type { ERoutesPageNames } from './paths'

export type TNavKey = `nav.${keyof TTranslationResources['nav']}`
export type TNavGroupId = keyof TTranslationResources['navGroups']

export const enum ERouterElementType {
	ABSTRACT = 'ABSTRACT',
	GROUP = 'GROUP',
	PAGE = 'PAGE',
	EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export interface IRouterElement {
	path: string
	fullPath?: string
	element?: ReactNode
	icon?: ReactNode
	type?: ERouterElementType
	group?: TNavGroupId
	name?: TNavKey
	isDisabled?: boolean
	getFullPathDynamic?: (value: string) => string
}

export interface IRouteNode extends IRouterElement {
	children?: Partial<Record<ERoutesPageNames, IRouterElement>>
}

export interface IRoutes extends Partial<Record<ERoutesPageNames, IRouteNode>> {}
