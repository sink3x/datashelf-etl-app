import type { FC } from 'react'

import { Column } from '@ant-design/plots'

import { chartPalette } from '@styles/tokens'
import { formatCompactNumber } from '@utils/format-number'

import { AXIS_STYLE, CHART_HEIGHT, CHART_THEME } from '../chart.constants'

import type { IBarChartProps } from './BarChart.interfaces'

const LONG_LABEL_THRESHOLD = 6

export const BarChart: FC<IBarChartProps> = (props) => {
	const { values } = props

	const hasManyBars = values.length > LONG_LABEL_THRESHOLD

	const config = {
		data: values,
		xField: 'label',
		yField: 'value',
		colorField: 'label',
		height: CHART_HEIGHT,
		autoFit: true,
		theme: CHART_THEME,
		legend: false,
		scale: { color: { range: [...chartPalette] } },
		style: { radiusTopLeft: 4, radiusTopRight: 4, maxWidth: 48 },
		axis: {
			x: {
				...AXIS_STYLE,
				grid: false,
				labelAutoRotate: hasManyBars,
				labelAutoHide: hasManyBars,
			},
			y: { ...AXIS_STYLE, labelFormatter: (value: number) => formatCompactNumber(value) },
		},
		tooltip: {
			items: [{ channel: 'y', valueFormatter: (value: number) => formatCompactNumber(value) }],
		},
	}

	return <Column {...config} />
}
