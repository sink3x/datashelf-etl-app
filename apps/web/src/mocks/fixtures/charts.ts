import type { TChart, TChartsByName } from '@interfaces/chart'

const MONTHS = [
	'2023-01',
	'2023-02',
	'2023-03',
	'2023-04',
	'2023-05',
	'2023-06',
	'2023-07',
	'2023-08',
	'2023-09',
	'2023-10',
	'2023-11',
	'2023-12',
]
const MONTHLY_SALES = [
	94120.35, 88410.2, 101233.9, 99870.15, 108450.6, 112980.45, 118304.1, 115220.75, 104510.3, 109875.2,
	121640.85, 137410.55,
]

const CITIES = [
	'New York',
	'Los Angeles',
	'Chicago',
	'Houston',
	'Phoenix',
	'Seattle',
	'Boston',
	'Miami',
	'Atlanta',
	'Denver',
	'San Francisco',
	'Dallas',
]
const CITY_SALES = [
	181240.5, 162310.75, 138905.2, 121880.4, 98765.3, 94320.15, 90110.6, 87650.25, 82540.9, 79210.35, 76330.8,
	71240.45,
]
const CITY_COUNTS = [3461, 3099, 2652, 2327, 1886, 1801, 1720, 1673, 1576, 1512, 1457, 1363]

const STORE_TYPES = [
	'Supermarket',
	'Convenience Store',
	'Warehouse Club',
	'Pharmacy',
	'Department Store',
	'Specialty Store',
]
const STORE_TYPE_SALES = [312450.8, 241330.25, 228905.6, 187210.4, 168440.15, 146193.22]
const STORE_TYPE_COUNTS = [5962, 4605, 4368, 3572, 3214, 2806]

const CUSTOMER_CATEGORIES = [
	'Professional',
	'Young Adult',
	'Middle-Aged',
	'Senior Citizen',
	'Student',
	'Homemaker',
	'Retiree',
	'Teenager',
]
const CUSTOMER_CATEGORY_COUNTS = [3912, 3488, 3301, 3127, 2964, 2840, 2611, 2284]

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Mobile Payment', 'Cash']
const PAYMENT_METHOD_COUNTS = [7841, 6528, 5402, 4756]

const SEASONAL_PRODUCTS: Record<string, { labels: string[]; values: number[]; total: number }> = {
	Winter: {
		labels: ['Hot Chocolate', 'Soup', 'Tea', 'Bread', 'Milk'],
		values: [612, 548, 503, 471, 455],
		total: 14820,
	},
	Spring: {
		labels: ['Eggs', 'Spinach', 'Bread', 'Yogurt', 'Strawberries'],
		values: [587, 532, 498, 466, 441],
		total: 14205,
	},
	Summer: {
		labels: ['Ice Cream', 'Water', 'Watermelon', 'Sunscreen', 'Lemonade'],
		values: [701, 655, 594, 538, 502],
		total: 15930,
	},
	Fall: {
		labels: ['Apples', 'Pumpkin', 'Coffee', 'Bread', 'Cereal'],
		values: [576, 541, 517, 482, 463],
		total: 14390,
	},
}

const round2 = (value: number) => Math.round(value * 100) / 100

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

const percent = (part: number, total: number) => (total > 0 ? round2((100 * part) / total) : 0)

const hashString = (value: string) =>
	[...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)

export const getDatasetScale = (filename: string) => 0.75 + (hashString(filename) % 50) / 100

const frequencyChart = (
	name: string,
	title: string,
	description: string,
	labels: string[],
	values: number[],
) => {
	const total = sum(values)

	return {
		name,
		title,
		description,
		type: 'frequency',
		labels,
		values,
		total,
		top: { label: labels[0] ?? null, count: values[0] ?? 0, percentage: percent(values[0] ?? 0, total) },
	} satisfies TChart
}

const pieChart = (name: string, title: string, description: string, labels: string[], values: number[]) => {
	const total = sum(values)

	return {
		name,
		title,
		description,
		type: 'pie',
		labels,
		values,
		total,
		top: { label: labels[0] ?? null, count: values[0] ?? 0, percentage: percent(values[0] ?? 0, total) },
	} satisfies TChart
}

export const buildRetailCharts = (filename: string): TChartsByName => {
	const scale = getDatasetScale(filename)
	const scaleMoney = (values: number[]) => values.map((value) => round2(value * scale))
	const scaleCount = (values: number[]) => values.map((value) => Math.round(value * scale))

	const monthlySales = scaleMoney(MONTHLY_SALES)
	const citySales = scaleMoney(CITY_SALES)
	const cityCounts = scaleCount(CITY_COUNTS)
	const storeTypeSales = scaleMoney(STORE_TYPE_SALES)
	const totalSales = round2(sum(monthlySales))
	const totalTransactions = sum(cityCounts)
	const uniqueCustomers = Math.round(totalTransactions * 0.74)
	const bestMonthIndex = monthlySales.indexOf(Math.max(...monthlySales))

	const charts: TChart[] = [
		{
			name: 'total_sales',
			title: 'Total Sales',
			description: 'Total revenue from all sales.',
			type: 'metric',
			value: totalSales,
			unit_sign: '$',
		},
		{
			name: 'average_sale_value',
			title: 'Average Sale Value',
			description: 'Mean value of a single sale transaction.',
			type: 'metric',
			value: round2(totalSales / totalTransactions),
			unit_sign: '$',
		},
		{
			name: 'average_items_per_transaction',
			title: 'Average Items per Transaction',
			description: 'Mean number of items per transaction.',
			type: 'metric',
			value: 5.49,
			unit_sign: '',
		},
		{
			name: 'total_transactions',
			title: 'Total Transactions',
			description: 'Total number of transactions recorded.',
			type: 'metric',
			value: totalTransactions,
			unit_sign: '',
		},
		{
			name: 'unique_customers',
			title: 'Unique Customers',
			description: 'Number of distinct customers who made purchases.',
			type: 'metric',
			value: uniqueCustomers,
			unit_sign: '',
		},
		{
			name: 'repeat_customers',
			title: 'Repeat Customers',
			description: 'Customers who made more than one transaction.',
			type: 'metric',
			value: Math.round(uniqueCustomers * 0.22),
			unit_sign: '',
		},
		{
			name: 'best_month',
			title: 'Best Month for Sales',
			description: 'The month with the highest total sales.',
			type: 'metric',
			value: MONTHS[bestMonthIndex]!,
			extra: { sales: monthlySales[bestMonthIndex] },
		},
		{
			name: 'monthly_sales',
			title: 'Monthly Sales Trend',
			description: 'Total sales aggregated by month.',
			type: 'line',
			labels: MONTHS,
			values: monthlySales,
		},
		{
			name: 'total_sales_by_month',
			title: 'Total Sales by Month',
			description: 'Line chart showing total sales aggregated by month.',
			type: 'line',
			labels: MONTHS,
			values: monthlySales,
		},
		{
			name: 'sales_by_city',
			title: 'Sales by City',
			description: 'Total sales per city.',
			type: 'bar',
			labels: CITIES,
			values: citySales,
		},
		{
			name: 'sales_by_store_type',
			title: 'Sales by Store Type',
			description: 'Total sales aggregated by store type.',
			type: 'bar',
			labels: STORE_TYPES,
			values: storeTypeSales,
			unit_sign: '',
		},
		{
			name: 'city_sales_summary',
			title: 'Total Sales and Count by City',
			description: 'Total sales amount and number of entries per city, for visualization in charts.',
			type: 'grouped',
			labels: CITIES,
			values_sum: citySales,
			values_count: cityCounts,
			top: {
				label: CITIES[0]!,
				total_sales: citySales[0],
				count: cityCounts[0],
				sales_percentage: percent(citySales[0]!, sum(citySales)),
			},
		},
		frequencyChart(
			'city_wordcloud_data',
			'City Frequency Distribution',
			'Frequency distribution of cities in the dataset, for visualization as a word cloud or bar chart.',
			CITIES,
			cityCounts,
		),
		frequencyChart(
			'customer_category_wordcloud_data',
			'Customer Category Frequency',
			'Frequency distribution of customer categories in the dataset.',
			CUSTOMER_CATEGORIES,
			scaleCount(CUSTOMER_CATEGORY_COUNTS),
		),
		pieChart(
			'customer_category_distribution_pie',
			'Distribution of Customer Categories',
			'Share of transactions made by each customer category.',
			CUSTOMER_CATEGORIES,
			scaleCount(CUSTOMER_CATEGORY_COUNTS),
		),
		pieChart(
			'payment_method_distribution_pie',
			'Distribution of Payment Methods',
			'This pie chart displays the share of different payment methods used in transactions such as cash, card, etc.',
			PAYMENT_METHODS,
			scaleCount(PAYMENT_METHOD_COUNTS),
		),
		pieChart(
			'store_type_distribution_pie',
			'Distribution of Store Types',
			'Share of transactions made in each type of store.',
			STORE_TYPES,
			scaleCount(STORE_TYPE_COUNTS),
		),
		...Object.entries(SEASONAL_PRODUCTS).map(
			([season, { labels, values, total }]): TChart => ({
				name: `top5_products_${season.toLowerCase()}`,
				title: `Top 5 Products in ${season}`,
				description: `Top 5 most frequent products sold in the ${season} season.`,
				type: 'bar',
				labels,
				values: scaleCount(values),
				total: Math.round(total * scale),
				top: { label: labels[0] ?? null, count: values[0], percentage: percent(values[0] ?? 0, total) },
			}),
		),
	]

	return Object.fromEntries(charts.map((chart) => [chart.name, [chart]]))
}
