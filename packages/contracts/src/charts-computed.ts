import { z } from 'zod'

export const CHARTS_COMPUTED_EVENT_TYPE = 'dataset.charts.computed'
export const CHARTS_COMPUTED_SCHEMA_VERSION = 1

const chartBase = {
  name: z.string().regex(/^[a-z0-9_]+$/),
  title: z.string(),
  description: z.string(),
}

const topSchema = z.looseObject({
  label: z.string().nullable(),
})

export const seriesChartSchema = z.looseObject({
  ...chartBase,
  type: z.enum(['line', 'bar', 'pie', 'area']),
  labels: z.array(z.string()),
  values: z.array(z.number()),
})

export const frequencyChartSchema = z.looseObject({
  ...chartBase,
  type: z.literal('frequency'),
  labels: z.array(z.string()),
  values: z.array(z.number()),
  total: z.number(),
  top: topSchema,
})

export const groupedChartSchema = z.looseObject({
  ...chartBase,
  type: z.literal('grouped'),
  labels: z.array(z.string()),
  values_sum: z.array(z.number()),
  values_count: z.array(z.number()),
  top: topSchema,
})

export const metricChartSchema = z.looseObject({
  ...chartBase,
  type: z.literal('metric'),
  value: z.union([z.number(), z.string()]),
  unit_sign: z.string().optional(),
})

export const chartSchema = z.discriminatedUnion('type', [
  seriesChartSchema,
  frequencyChartSchema,
  groupedChartSchema,
  metricChartSchema,
])

export const chartsComputedEventSchema = z.strictObject({
  event_id: z.uuid(),
  event_type: z.literal(CHARTS_COMPUTED_EVENT_TYPE),
  schema_version: z.literal(CHARTS_COMPUTED_SCHEMA_VERSION),
  occurred_at: z.iso.datetime({ offset: true }),
  run_id: z.string().min(1).max(250),
  job: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
  dataset: z.strictObject({
    object_key: z.string().min(1),
    filename: z.string().min(1),
  }),
  processing_time_sec: z.number().nonnegative(),
  meta: z.record(z.string(), z.unknown()),
  charts: z.array(chartSchema).min(1),
})

export type TChart = z.infer<typeof chartSchema>
export type TChartType = TChart['type']
export type TChartsComputedEvent = z.infer<typeof chartsComputedEventSchema>
