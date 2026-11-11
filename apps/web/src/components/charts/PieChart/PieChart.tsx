import type { FC } from 'react'

import { Pie } from '@ant-design/plots'

import { useLanguage } from '@hooks/use-language'
import { chartPalette, colors, fonts } from '@styles/tokens'
import { formatPercent } from '@utils/format-number'

import { CHART_HEIGHT, CHART_THEME } from '../chart.constants'

import type { IPieChartProps } from './PieChart.interfaces'

export const PieChart: FC<IPieChartProps> = (props) => {
	const { values } = props

	const { intlLocale } = useLanguage()

	const total = values.reduce((sum, { value }) => sum + value, 0)

	const config = {
		data: values,
		angleField: 'value',
		colorField: 'label',
		height: CHART_HEIGHT,
		autoFit: true,
		theme: CHART_THEME,
		innerRadius: 0.62,
		radius: 0.9,
		scale: { color: { range: [...chartPalette] } },
		style: { stroke: colors.surface, lineWidth: 2, inset: 1, radius: 4 },
		label: {
			text: (datum: { value: number }) => (total ? formatPercent(datum.value / total, intlLocale) : ''),
			position: 'outside',
			style: { fill: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
		},
		legend: {
			color: {
				title: false,
				position: 'bottom',
				layout: { justifyContent: 'center' },
				itemLabelFill: colors.ink,
				itemLabelFontFamily: fonts.sans,
			},
		},
	}

	return <Pie {...config} />
}
