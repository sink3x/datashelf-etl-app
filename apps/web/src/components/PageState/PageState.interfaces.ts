import type { ReactNode } from 'react'

export type TPageStateTone = 'neutral' | 'error'

export interface IPageStateProps {
	tone?: TPageStateTone
	icon?: ReactNode
	title: string
	description?: ReactNode
	actions?: ReactNode
}
