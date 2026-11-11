import type { TChart } from '@datashelf/contracts'
import type { Connection, Model } from 'mongoose'
import { Schema } from 'mongoose'

export const CHART_RESULT_COLLECTION = 'chart_results'

export interface IChartResult {
  run_id: string
  job: string
  event_id: string
  dataset: {
    object_key: string
    filename: string
  }
  occurred_at: Date
  processing_time_sec: number
  meta: Record<string, unknown>
  charts: TChart[]
  createdAt: Date
  updatedAt: Date
}

export type TChartResultModel = Model<IChartResult>

const chartResultSchema = new Schema<IChartResult>(
  {
    run_id: { type: String, required: true },
    job: { type: String, required: true },
    event_id: { type: String, required: true },
    dataset: {
      object_key: { type: String, required: true },
      filename: { type: String, required: true },
    },
    occurred_at: { type: Date, required: true },
    processing_time_sec: { type: Number, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    charts: { type: Schema.Types.Mixed, required: true },
  },
  {
    collection: CHART_RESULT_COLLECTION,
    timestamps: true,
    versionKey: false,
    minimize: false,
    autoIndex: false,
  },
)

chartResultSchema.index({ run_id: 1, job: 1 }, { unique: true, name: 'run_id_job_unique' })
chartResultSchema.index({ 'dataset.filename': 1 }, { name: 'dataset_filename' })

export const createChartResultModel = (connection: Connection): TChartResultModel =>
  connection.model<IChartResult>('ChartResult', chartResultSchema)
