import { afterEach, describe, expect, it, vi } from 'vitest'

import { createRun, getChartsByFilename, getRun, listRawFiles, resetMockDb } from './db'

describe('mock dag runs', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('moves an uploaded file from queued to running to success and then exposes its charts', () => {
		vi.useFakeTimers({ now: new Date('2025-06-01T10:15:00.000Z') })
		resetMockDb({ queuedMs: 1000, runningMs: 2000 })

		const run = createRun('customer_data_etl', 'sales.csv', 2048)
		const filename = run.conf.object_key!.split('/').at(-1)!

		expect(run.conf.object_key).toBe('raw-data/sales-1748772900.csv')
		expect(listRawFiles().at(-1)?.fileName).toBe(filename)
		expect(getRun('customer_data_etl', run.dag_run_id)?.state).toBe('queued')
		expect(getChartsByFilename(filename)).toEqual({})

		vi.advanceTimersByTime(1500)
		expect(getRun('customer_data_etl', run.dag_run_id)?.state).toBe('running')

		vi.advanceTimersByTime(2000)
		const finished = getRun('customer_data_etl', run.dag_run_id)

		expect(finished?.state).toBe('success')
		expect(finished?.end_date).toBe('2025-06-01T10:15:03.000Z')
		expect(Object.keys(getChartsByFilename(filename))).toContain('total_sales')
	})

	it('does not find runs of another dag', () => {
		const run = createRun('customer_data_etl', 'sales.csv', 10)

		expect(getRun('other_dag', run.dag_run_id)).toBeNull()
	})
})
