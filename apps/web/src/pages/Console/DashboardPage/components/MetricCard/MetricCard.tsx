import type { FC } from 'react'

import { Tooltip } from 'antd'

import { toDigits } from '@utils/to-digits'

import * as Styled from './MetricCard.styles'

import type { IMetricCardProps } from './MetricCard.interfaces'

export const MetricCard: FC<IMetricCardProps> = (props) => {
	const { chartFormatted, ...restProps } = props

	return (
		<Styled.MetricCardContainer
			key={chartFormatted.name}
			className={`chart-card chart-${chartFormatted.type}`}
			{...restProps}
		>
			<Tooltip placement="bottom" title={`${chartFormatted.value} ${chartFormatted?.unit_sign}`}>
				<Styled.CardTitle>{chartFormatted.title}</Styled.CardTitle>
				<Styled.CardValue>
					{toDigits(chartFormatted.value)}
					{chartFormatted?.unit_sign}
				</Styled.CardValue>
			</Tooltip>
		</Styled.MetricCardContainer>
	)
}
