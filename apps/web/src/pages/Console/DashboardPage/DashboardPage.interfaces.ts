import type { IDatasetProcessed } from '@interfaces/dataset-processed'

export interface ICharts extends Record<string, IDatasetProcessed['chart'][]> {}
