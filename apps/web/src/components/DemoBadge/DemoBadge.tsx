import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

import { IS_API_MOCK } from '@shared/constants'

import * as Styled from './DemoBadge.styles'

export const DemoBadge = () => {
	const { t } = useTranslation()

	if (!IS_API_MOCK) {
		return null
	}

	return (
		<Tooltip title={t('demoBadge.tooltip')}>
			<Styled.Badge tabIndex={0}>{t('demoBadge.label')}</Styled.Badge>
		</Tooltip>
	)
}
