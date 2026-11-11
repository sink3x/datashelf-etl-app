import { describe, expect, it } from 'vitest'

import type { TChart, TChartsByName } from '@interfaces/chart'

import { buildDashboardLayout, pickLatestChart } from './DashboardPage.utils'

const series = (name: string, type: 'line' | 'bar' | 'pie' = 'bar'): TChart => ({
	name,
	title: name,
	description: '',
	type,
	labels: ['a'],
	values: [1],
})

const metric = (name: string, value: number | string = 1): TChart => ({
	name,
	title: name,
	description: '',
	type: 'metric',
	value,
})

const byName = (...charts: TChart[]): TChartsByName =>
	Object.fromEntries(charts.map((chart) => [chart.name, [chart]]))

describe('pickLatestChart', () => {
	it('returns the most recently processed chart', () => {
		const older = metric('total_sales', 1)
		const newer = metric('total_sales', 2)

		expect(pickLatestChart([older, newer])).toBe(newer)
		expect(pickLatestChart(undefined)).toBeUndefined()
	})
})

describe('buildDashboardLayout', () => {
	it('orders metrics by importance and appends unknown metrics', () => {
		const layout = buildDashboardLayout(
			byName(
				metric('custom_metric'),
				metric('unique_customers'),
				metric('total_sales'),
				metric('best_month', '2023-12'),
			),
		)

		expect(layout.metrics.map((chart) => chart.name)).toEqual([
			'total_sales',
			'unique_customers',
			'best_month',
			'custom_metric',
		])
	})

	it('shows only one of the duplicate monthly sales charts', () => {
		const layout = buildDashboardLayout(
			byName(series('total_sales_by_month', 'line'), series('monthly_sales', 'line')),
		)

		expect(layout.sections).toHaveLength(1)
		expect(layout.sections[0]?.charts.map((chart) => chart.name)).toEqual(['monthly_sales'])
	})

	it('groups seasonal products in calendar order', () => {
		const layout = buildDashboardLayout(
			byName(series('top5_products_fall'), series('top5_products_winter'), series('top5_products_summer')),
		)

		expect(layout.sections[0]?.id).toBe('seasons')
		expect(layout.sections[0]?.charts.map((chart) => chart.name)).toEqual([
			'top5_products_winter',
			'top5_products_summer',
			'top5_products_fall',
		])
	})

	it('puts charts without a template slot into the other section', () => {
		const layout = buildDashboardLayout(byName(series('sales_by_city'), series('returns_by_reason', 'pie')))

		expect(layout.sections.map((section) => [section.id, section.charts.map((chart) => chart.name)])).toEqual(
			[
				['sales', ['sales_by_city']],
				['other', ['returns_by_reason']],
			],
		)
		expect(layout.chartCount).toBe(2)
	})

	it('returns an empty layout without charts', () => {
		expect(buildDashboardLayout({})).toEqual({ metrics: [], sections: [], chartCount: 0 })
	})
})
