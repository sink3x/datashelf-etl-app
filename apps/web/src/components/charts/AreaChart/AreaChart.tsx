import type { FC } from 'react'

import { Area } from '@ant-design/plots'

import { colors } from '@styles/tokens'
import { formatCompactNumber } from '@utils/format-number'

import { AXIS_STYLE, CHART_HEIGHT, CHART_THEME } from '../chart.constants'

import type { IAreaChartProps } from './AreaChart.interfaces'

export const AreaChart: FC<IAreaChartProps> = (props) => {
	const { values } = props

	const config = {
		data: values,
		xField: 'label',
		yField: 'value',
		height: CHART_HEIGHT,
		autoFit: true,
		theme: CHART_THEME,
		shapeField: 'smooth',
		style: {
			fill: `linear-gradient(-90deg, ${colors.surface} 0%, ${colors.accentSoft} 60%, ${colors.accent} 100%)`,
			fillOpacity: 0.6,
		},
		line: {
			shapeField: 'smooth',
			style: { stroke: colors.accent, strokeWidth: 2 },
		},
		axis: {
			x: { ...AXIS_STYLE, grid: false },
			y: { ...AXIS_STYLE, labelFormatter: (value: number) => formatCompactNumber(value) },
		},
		tooltip: {
			items: [{ channel: 'y', valueFormatter: (value: number) => formatCompactNumber(value) }],
		},
	}

	return <Area {...config} />
}
