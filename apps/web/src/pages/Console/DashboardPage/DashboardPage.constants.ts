export const METRIC_ORDER = [
	'total_sales',
	'total_transactions',
	'average_sale_value',
	'unique_customers',
	'repeat_customers',
	'average_items_per_transaction',
	'best_month',
]

export interface IDashboardSectionTemplate {
	id: string
	title: string
	description: string
	slots: Array<string | string[]>
	namePrefix?: string
	prefixOrder?: string[]
}

export const DASHBOARD_SECTIONS: IDashboardSectionTemplate[] = [
	{
		id: 'sales',
		title: 'Sales',
		description: 'Revenue over time, by city and by store type.',
		slots: [
			['monthly_sales', 'total_sales_by_month'],
			'city_sales_summary',
			'sales_by_city',
			'sales_by_store_type',
		],
	},
	{
		id: 'customers',
		title: 'Customers',
		description: 'Who buys, where they buy and how they pay.',
		slots: [
			'customer_category_distribution_pie',
			'payment_method_distribution_pie',
			'store_type_distribution_pie',
			'city_wordcloud_data',
			'customer_category_wordcloud_data',
		],
	},
	{
		id: 'seasons',
		title: 'Seasonal products',
		description: 'The five most frequent products in each season.',
		slots: [],
		namePrefix: 'top5_products_',
		prefixOrder: ['winter', 'spring', 'summer', 'fall', 'autumn'],
	},
]

export const OTHER_SECTION = {
	id: 'other',
	title: 'Other charts',
	description: 'Charts produced by the pipeline that have no dedicated place on this dashboard yet.',
}

export const WIDE_CHART_TYPES = new Set(['line', 'area', 'grouped', 'frequency'])
