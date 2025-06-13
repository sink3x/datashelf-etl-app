import { useRef, type FC } from 'react'

import { Column } from '@ant-design/plots'

import type { IBarchartProps } from './BarChart.interfaces'

export const BarChart: FC<IBarchartProps> = (props) => {
	const { values } = props

	const chartRef = useRef<unknown>(null)

	const config = {
		data: values,
		xField: 'type',
		yField: 'value',
		colorField: 'type',
		axis: {
			x: {
				label: {
					autoRotate: false,
					rotate: 45,
					textAlign: 'right',
					textBaseline: 'middle',
				},
				size: 60,
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
		onReady: (plot: unknown) => (chartRef.current = plot),
	}

	return <Column {...config} />
}
