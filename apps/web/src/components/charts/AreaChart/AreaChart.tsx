import type { FC } from 'react'

import { Area } from '@ant-design/plots'

import { EColorsMain } from '@styles/colors/colors-main'

import type { IAreaChartProps } from './AreaChart.interfacaes'

export const AreaChart: FC<IAreaChartProps> = (props) => {
	const { values } = props

	const config = {
		data: {
			value: values,
		},
		xField: 'type',
		yField: 'value',

		style: {
			fill: `linear-gradient(-90deg, ${EColorsMain.WHITE} 0%, ${EColorsMain.BLUE} 100%)`,
		},
		axis: {
			y: { labelFormatter: '~s' },
		},
		line: {
			style: {
				stroke: EColorsMain.BLUE,
				strokeWidth: 2,
			},
		},
		annotations: [
			{
				type: 'text',
				style: {
					x: '50%',
					y: '50%',
					textAlign: 'center',
					color: EColorsMain.WHITE,
					fontColor: EColorsMain.WHITE,
					fontSize: 15,
					fontStyle: 'bold',
				},
			},
		],
	}
	return <Area {...config} />
}
