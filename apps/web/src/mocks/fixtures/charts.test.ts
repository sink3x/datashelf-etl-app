import { chartSchema } from '@datashelf/contracts'
import { describe, expect, it } from 'vitest'

import { buildRetailCharts } from './charts'

const ETL_CHART_NAMES = [
	'total_sales',
	'average_sale_value',
	'average_items_per_transaction',
	'total_transactions',
	'unique_customers',
	'repeat_customers',
	'best_month',
	'monthly_sales',
	'total_sales_by_month',
	'sales_by_city',
	'sales_by_store_type',
	'city_sales_summary',
	'city_wordcloud_data',
	'customer_category_wordcloud_data',
	'customer_category_distribution_pie',
	'payment_method_distribution_pie',
	'store_type_distribution_pie',
	'top5_products_winter',
	'top5_products_spring',
	'top5_products_summer',
	'top5_products_fall',
]

describe('mock chart fixtures', () => {
	const charts = buildRetailCharts('retail-1748772900.csv')

	it('produces every chart name the ETL publishes', () => {
		expect(Object.keys(charts).sort()).toEqual([...ETL_CHART_NAMES].sort())
	})

	it.each(Object.entries(charts))('%s matches the shared chart contract', (_name, chartList) => {
		chartList.forEach((chart) => expect(chartSchema.safeParse(chart).success).toBe(true))
	})

	it('keeps label and value arrays aligned', () => {
		Object.values(charts)
			.flat()
			.forEach((chart) => {
				if (chart.type === 'grouped') {
					expect(chart.values_sum).toHaveLength(chart.labels.length)
					expect(chart.values_count).toHaveLength(chart.labels.length)
				} else if (chart.type !== 'metric') {
					expect(chart.values).toHaveLength(chart.labels.length)
				}
			})
	})
})
