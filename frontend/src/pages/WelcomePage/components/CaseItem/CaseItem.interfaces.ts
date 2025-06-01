import type { ReactNode } from 'react'

import type { SpaceProps } from 'antd'

export interface ICaseItemProps extends SpaceProps {
	icon: ReactNode
	title: string
	description: string
}
