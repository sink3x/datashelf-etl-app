import type { FC } from 'react'

import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

import { IS_API_MOCK } from '@shared/constants'

import * as Styled from './DemoBadge.styles'

import type { IDemoBadgeProps } from './DemoBadge.interfaces'

export const DemoBadge: FC<IDemoBadgeProps> = (props) => {
	const { isCompact = false } = props

	const { t } = useTranslation()

	if (!IS_API_MOCK) {
		return null
	}

	return (
		<Tooltip title={t('demoBadge.tooltip')}>
			<Styled.Badge tabIndex={0}>{isCompact ? t('demoBadge.shortLabel') : t('demoBadge.label')}</Styled.Badge>
		</Tooltip>
	)
}
