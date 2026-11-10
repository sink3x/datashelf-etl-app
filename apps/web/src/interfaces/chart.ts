import type { TChart, TChartType } from '@datashelf/contracts'

export type { TChart, TChartType }

export type TMetricChart = Extract<TChart, { type: 'metric' }>
export type TSeriesChart = Extract<TChart, { type: 'line' | 'bar' | 'pie' | 'area' }>
export type TFrequencyChart = Extract<TChart, { type: 'frequency' }>
export type TGroupedChart = Extract<TChart, { type: 'grouped' }>

export type TChartsByName = Record<string, TChart[]>
