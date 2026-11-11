import type { TTranslationResources } from '@shared/i18n/i18n.interfaces'

export const METRIC_ORDER = [
	'total_sales',
	'total_transactions',
	'average_sale_value',
	'unique_customers',
	'repeat_customers',
	'average_items_per_transaction',
	'best_month',
]

export type TDashboardSectionId = keyof TTranslationResources['dashboard']['sections']

export interface IDashboardSectionTemplate {
	id: TDashboardSectionId
	slots: Array<string | string[]>
	namePrefix?: string
	prefixOrder?: string[]
}

export const DASHBOARD_SECTIONS: IDashboardSectionTemplate[] = [
	{
		id: 'sales',
		slots: [
			['monthly_sales', 'total_sales_by_month'],
			'city_sales_summary',
			'sales_by_city',
			'sales_by_store_type',
		],
	},
	{
		id: 'customers',
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
		slots: [],
		namePrefix: 'top5_products_',
		prefixOrder: ['winter', 'spring', 'summer', 'fall', 'autumn'],
	},
]

export const OTHER_SECTION_ID: TDashboardSectionId = 'other'

export const WIDE_CHART_TYPES = new Set(['line', 'area', 'grouped', 'frequency'])
