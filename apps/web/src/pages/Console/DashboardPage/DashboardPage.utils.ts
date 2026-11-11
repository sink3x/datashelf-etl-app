import type { TChart, TChartsByName, TMetricChart } from '@interfaces/chart'

import {
	DASHBOARD_SECTIONS,
	METRIC_ORDER,
	OTHER_SECTION_ID,
	type TDashboardSectionId,
} from './DashboardPage.constants'

export interface IDashboardSection {
	id: TDashboardSectionId
	charts: TChart[]
}

export interface IDashboardLayout {
	metrics: TMetricChart[]
	sections: IDashboardSection[]
	chartCount: number
}

export const pickLatestChart = (chartList: TChart[] | undefined) => chartList?.at(-1)

const isMetric = (chart: TChart): chart is TMetricChart => chart.type === 'metric'

const orderIndex = (order: string[], value: string) => {
	const index = order.indexOf(value)

	return index === -1 ? order.length : index
}

export const buildDashboardLayout = (charts: TChartsByName): IDashboardLayout => {
	const latest = new Map<string, TChart>()

	Object.entries(charts).forEach(([name, chartList]) => {
		const chart = pickLatestChart(chartList)

		if (chart) {
			latest.set(name, chart)
		}
	})

	const consumed = new Set<string>()
	const take = (name: string) => {
		const chart = latest.get(name)

		if (chart) {
			consumed.add(name)
		}

		return chart
	}

	const metrics = [...latest.entries()]
		.filter(([, chart]) => isMetric(chart))
		.sort(([a], [b]) => orderIndex(METRIC_ORDER, a) - orderIndex(METRIC_ORDER, b))
		.map(([name]) => take(name) as TMetricChart)

	const sections: IDashboardSection[] = DASHBOARD_SECTIONS.map((template) => {
		const sectionCharts: TChart[] = []

		template.slots.forEach((slot) => {
			const alternatives = Array.isArray(slot) ? slot : [slot]
			const name = alternatives.find((candidate) => latest.has(candidate) && !consumed.has(candidate))

			if (name) {
				sectionCharts.push(take(name)!)
				alternatives.forEach((alternative) => consumed.add(alternative))
			}
		})

		if (template.namePrefix) {
			const { namePrefix, prefixOrder = [] } = template

			;[...latest.keys()]
				.filter((name) => name.startsWith(namePrefix) && !consumed.has(name))
				.sort(
					(a, b) =>
						orderIndex(prefixOrder, a.slice(namePrefix.length)) -
						orderIndex(prefixOrder, b.slice(namePrefix.length)),
				)
				.forEach((name) => sectionCharts.push(take(name)!))
		}

		return {
			id: template.id,
			charts: sectionCharts,
		}
	})

	const leftovers = [...latest.keys()].filter((name) => !consumed.has(name)).map((name) => take(name)!)

	return {
		metrics,
		sections: [...sections, { id: OTHER_SECTION_ID, charts: leftovers }].filter(
			({ charts: list }) => list.length,
		),
		chartCount: latest.size,
	}
}
