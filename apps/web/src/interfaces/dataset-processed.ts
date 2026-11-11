import type { IObjectAny } from './object-any'

export interface IDatasetProcessed {
	filename: string
	processed_at: string
	processing_time_sec: number
	meta: IObjectAny
	chart: IObjectAny
}
