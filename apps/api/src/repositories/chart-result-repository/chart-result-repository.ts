import type { TChartsComputedEvent } from '@datashelf/contracts'
import type { IChartResult, TChartResultModel } from '@models/chart-result-model/chart-result-model'
import type { Types } from 'mongoose'

export type TUpsertOutcome = 'created' | 'updated' | 'duplicate'

export type TChartResultRecord = IChartResult & { _id: Types.ObjectId }

export interface IChartResultRepository {
  ensureIndexes(): Promise<void>
  upsertFromEvent(event: TChartsComputedEvent): Promise<TUpsertOutcome>
  findLatest(limit: number): Promise<TChartResultRecord[]>
  findByFilename(filename: string): Promise<TChartResultRecord[]>
}

const DUPLICATE_KEY_ERROR_CODE = 11000

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR_CODE

export class ChartResultRepository implements IChartResultRepository {
  constructor(private readonly model: TChartResultModel) {}

  public async ensureIndexes() {
    await this.model.createIndexes()
  }

  /*
   * One document per (run_id, job). The filter only matches an existing document that holds a
   * different, not newer event, so a redelivered or stale event falls through to the upsert insert,
   * hits the unique index and is reported as a duplicate instead of overwriting newer data.
   */
  public async upsertFromEvent(event: TChartsComputedEvent): Promise<TUpsertOutcome> {
    const occurredAt = new Date(event.occurred_at)

    try {
      const result = await this.model.updateOne(
        {
          run_id: event.run_id,
          job: event.job,
          event_id: { $ne: event.event_id },
          occurred_at: { $lte: occurredAt },
        },
        {
          $set: {
            event_id: event.event_id,
            dataset: event.dataset,
            occurred_at: occurredAt,
            processing_time_sec: event.processing_time_sec,
            meta: event.meta,
            charts: event.charts,
          },
        },
        { upsert: true },
      )

      return result.upsertedCount > 0 ? 'created' : 'updated'
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return 'duplicate'
      }

      throw error
    }
  }

  public async findLatest(limit: number) {
    return this.model.find().sort({ occurred_at: -1, _id: -1 }).limit(limit).lean<TChartResultRecord[]>()
  }

  public async findByFilename(filename: string) {
    return this.model
      .find({ 'dataset.filename': filename })
      .sort({ occurred_at: 1, _id: 1 })
      .lean<TChartResultRecord[]>()
  }
}
