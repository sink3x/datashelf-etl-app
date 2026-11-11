import type { FC } from 'react'

import { Tooltip } from 'antd'

import { formatMetricValue, formatMetricValueFull } from '@components/charts/chart-adapters'
import { useLanguage } from '@hooks/use-language'

import * as Styled from './MetricCard.styles'

import type { IMetricCardProps } from './MetricCard.interfaces'

export const MetricCard: FC<IMetricCardProps> = (props) => {
	const { chart, className } = props

	const { intlLocale } = useLanguage()

	const fullValue = formatMetricValueFull(chart, intlLocale)

	return (
		<Styled.MetricCardContainer className={className} data-testid={`metric-${chart.name}`}>
			<Styled.CardTitle>{chart.title}</Styled.CardTitle>
			<Tooltip
				placement="bottom"
				title={chart.description ? `${fullValue}. ${chart.description}` : fullValue}
			>
				<Styled.CardValue tabIndex={0} aria-label={`${chart.title}: ${fullValue}`}>
					{formatMetricValue(chart, intlLocale)}
				</Styled.CardValue>
			</Tooltip>
		</Styled.MetricCardContainer>
	)
}
