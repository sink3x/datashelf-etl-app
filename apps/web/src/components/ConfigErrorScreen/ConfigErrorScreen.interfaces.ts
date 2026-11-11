import type { ReactNode } from 'react'

import type { IAppConfigIssue } from '@shared/config/config.schema'

export interface IConfigErrorScreenProps {
	issues: IAppConfigIssue[]
	title?: string
	description?: ReactNode
}
