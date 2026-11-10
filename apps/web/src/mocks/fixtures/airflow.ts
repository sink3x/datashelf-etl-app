import type { IDag } from '@interfaces/dag'

export const MOCK_DAGS: IDag[] = [
	{
		dag_id: 'customer_data_etl',
		dag_display_name: 'Customer data ETL',
		description:
			'Loads an uploaded retail dataset, computes sales and customer analytics and publishes the charts.',
		is_paused: false,
		is_stale: false,
		has_import_errors: false,
		owners: ['datashelf'],
		tags: [{ name: 'etl' }, { name: 'retail' }],
		timetable_description: 'Never, external triggers only',
		timetable_summary: null,
		last_parsed_time: '2025-06-01T09:58:12.418Z',
		next_dagrun_logical_date: null,
		max_active_runs: 16,
	},
]

export const MOCK_RAW_FILES_SEED = [
	{
		fileName: 'retail-transactions-2023-1748772900.csv',
		size: 4_812_330,
		lastModified: '2025-06-01T10:15:00.000Z',
	},
	{ fileName: 'store-sales-q4-1748600100.csv', size: 1_204_118, lastModified: '2025-05-30T10:15:00.000Z' },
	{ fileName: 'holiday-orders-1748341500.json', size: 2_640_905, lastModified: '2025-05-27T10:25:00.000Z' },
]
