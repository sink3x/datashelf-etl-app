import type { ReactNode } from 'react'

import type { ERoutesPageNames } from './routes'

export interface IRoutePage {
	path: string
	element: ReactNode
	icon?: ReactNode
}

export interface IRoutes extends Record<ERoutesPageNames, IRoutePage> {}
