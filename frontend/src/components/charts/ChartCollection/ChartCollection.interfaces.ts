import type { IObjectAny } from '@interfaces/object-any'

export type TChartType = 'pie' | 'line' | 'bar' | 'frequency' | 'grouped'

export interface IChartCollectionProps {
	data: IObjectAny
	values: IObjectAny
	type: TChartType
}
