import type { FC } from 'react'

import { Pie } from '@ant-design/plots'

import { EColorsMain } from '@styles/colors/colors-main'

import type { IPieChartProps, IPieChartValue } from './PieChart.interfaces'

export const PieChart: FC<IPieChartProps> = (props) => {
	const { values } = props

	const config = {
		data: values,
		angleField: 'value',
		colorField: 'type',
		innerRadius: 0.6,
		labels: [
			{
				text: 'type',
				style: {
					fontWeight: 'bold',
					fill: EColorsMain.BLACK,
				},
			},
			{
				text: (dataValue: IPieChartValue, _index: number, _allData: IPieChartValue[]) => dataValue.value,
				style: {
					fontSize: 9,
					dy: 12,
					fill: EColorsMain.BLACK,
				},
			},
		],
		legend: {
			color: {
				title: false,
				position: 'right',
				rowPadding: 5,
			},
		},
		style: { stroke: '#fff', inset: 1, radius: 10 },
		scale: {
			color: {
				palette: 'spectral',
				offset: (t: number) => t * 0.8 + 0.1,
			},
		},
		annotations: [
			{
				type: 'text',
				style: {
					x: '50%',
					y: '50%',
					textAlign: 'center',
					fontSize: 15,
					fontStyle: 'bold',
				},
			},
		],
	}

	return <Pie {...config} />
}
