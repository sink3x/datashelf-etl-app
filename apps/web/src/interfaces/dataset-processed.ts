import type { TChart } from './chart'

export interface IDatasetProcessed {
	id?: string
	filename: string
	processed_at: string
	processing_time_sec: number
	meta: Record<string, unknown>
	chart: TChart | TChart[]
}
