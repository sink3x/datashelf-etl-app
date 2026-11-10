import { type FC } from 'react'

import { toJS } from 'mobx'

import { adapterWordCloudValueList } from '@components/charts/WordCloud/WordCloud.utils'

import { AreaChart } from '../AreaChart/AreaChart'
import { BarChart } from '../BarChart/BarChart'
import { GeographMap } from '../GeographMap/GeographMap'
import { adapterGeographMapValuesList } from '../GeographMap/GeographMap.utils'
import { PieChart } from '../PieChart/PieChart'
import { WordCloud } from '../WordCloud/WordCloud'

import { adapterBaseChartValueList } from './ChartCollection.utils'

import type { IChartCollectionProps } from './ChartCollection.interfaces'

export const ChartCollection: FC<IChartCollectionProps> = (props) => {
	const { data, type } = props

	switch (type) {
		case 'pie':
			return <PieChart values={adapterBaseChartValueList(data?.values, data?.labels)} />
		case 'line':
			return <AreaChart values={adapterBaseChartValueList(data?.values, data?.labels)} />
		case 'bar':
			return <BarChart values={adapterBaseChartValueList(data?.values, data?.labels)} />
		case 'frequency':
			return <WordCloud values={adapterWordCloudValueList(data?.values, data?.labels)} />
		case 'grouped':
			return <GeographMap values={adapterGeographMapValuesList(data?.values_sum, data?.labels)} />
		default:
			console.log('# type', toJS(type))
			return null
	}
}
