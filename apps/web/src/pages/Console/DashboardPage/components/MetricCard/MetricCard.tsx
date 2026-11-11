import type { FC } from 'react'

import { Tooltip } from 'antd'

import { formatMetricValue, formatMetricValueFull } from '@components/charts/chart-adapters'

import * as Styled from './MetricCard.styles'

import type { IMetricCardProps } from './MetricCard.interfaces'

export const MetricCard: FC<IMetricCardProps> = (props) => {
	const { chart, className } = props

	const fullValue = formatMetricValueFull(chart)

	return (
		<Styled.MetricCardContainer className={className} data-testid={`metric-${chart.name}`}>
			<Styled.CardTitle>{chart.title}</Styled.CardTitle>
			<Tooltip
				placement="bottom"
				title={chart.description ? `${fullValue}. ${chart.description}` : fullValue}
			>
				<Styled.CardValue tabIndex={0} aria-label={`${chart.title}: ${fullValue}`}>
					{formatMetricValue(chart)}
				</Styled.CardValue>
			</Tooltip>
		</Styled.MetricCardContainer>
	)
}
