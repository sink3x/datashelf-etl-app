import { lazy, Suspense, type FC } from 'react'

import { Skeleton } from 'antd'

import { toCitySalesList, toLabelValueList, toWordCloudList } from '../chart-adapters'
import { CHART_HEIGHT } from '../chart.constants'

import type { IChartCollectionProps } from './ChartCollection.interfaces'

const AreaChart = lazy(() =>
	import('../AreaChart/AreaChart').then((module) => ({ default: module.AreaChart })),
)
const BarChart = lazy(() => import('../BarChart/BarChart').then((module) => ({ default: module.BarChart })))
const PieChart = lazy(() => import('../PieChart/PieChart').then((module) => ({ default: module.PieChart })))
const WordCloud = lazy(() =>
	import('../WordCloud/WordCloud').then((module) => ({ default: module.WordCloud })),
)
const GeographMap = lazy(() =>
	import('../GeographMap/GeographMap').then((module) => ({ default: module.GeographMap })),
)

const ChartBody: FC<IChartCollectionProps> = (props) => {
	const { chart } = props

	switch (chart.type) {
		case 'pie':
			return <PieChart values={toLabelValueList(chart.labels, chart.values)} />
		case 'line':
		case 'area':
			return <AreaChart values={toLabelValueList(chart.labels, chart.values)} />
		case 'bar':
			return <BarChart values={toLabelValueList(chart.labels, chart.values)} />
		case 'frequency':
			return <WordCloud values={toWordCloudList(chart.labels, chart.values)} />
		case 'grouped':
			return <GeographMap values={toCitySalesList(chart.labels, chart.values_sum)} />
		default:
			return null
	}
}

export const ChartCollection: FC<IChartCollectionProps> = (props) => (
	<Suspense fallback={<Skeleton.Node active style={{ width: '100%', height: CHART_HEIGHT }} />}>
		<ChartBody {...props} />
	</Suspense>
)
