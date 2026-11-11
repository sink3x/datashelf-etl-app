import type { TChartsComputedEvent } from '@datashelf/contracts'
import { describe, expect, it, vi } from 'vitest'

import type { TChartResultModel } from '../../src/models/chart-result-model/chart-result-model'
import { ChartResultRepository } from '../../src/repositories/chart-result-repository/chart-result-repository'
import { readFixture } from '../helpers'

const event = readFixture('valid/series-and-metric.json') as unknown as TChartsComputedEvent

const createRepository = (updateOne: ReturnType<typeof vi.fn>) =>
  new ChartResultRepository({ updateOne } as unknown as TChartResultModel)

describe('ChartResultRepository.upsertFromEvent', () => {
  it('upserts by (run_id, job) and only overwrites older, different events', async () => {
    const updateOne = vi.fn(async () => ({ upsertedCount: 1, modifiedCount: 0 }))

    await expect(createRepository(updateOne).upsertFromEvent(event)).resolves.toBe('created')

    expect(updateOne).toHaveBeenCalledWith(
      {
        run_id: event.run_id,
        job: event.job,
        event_id: { $ne: event.event_id },
        occurred_at: { $lte: new Date(event.occurred_at) },
      },
      {
        $set: expect.objectContaining({
          event_id: event.event_id,
          dataset: event.dataset,
          charts: event.charts,
          occurred_at: new Date(event.occurred_at),
        }),
      },
      { upsert: true },
    )
  })

  it('reports an update when a newer event replaces the stored one', async () => {
    const updateOne = vi.fn(async () => ({ upsertedCount: 0, modifiedCount: 1 }))

    await expect(createRepository(updateOne).upsertFromEvent(event)).resolves.toBe('updated')
  })

  it('treats a unique index violation as an idempotent duplicate', async () => {
    const updateOne = vi.fn(async () => {
      throw Object.assign(new Error('E11000 duplicate key error'), { code: 11000 })
    })

    await expect(createRepository(updateOne).upsertFromEvent(event)).resolves.toBe('duplicate')
  })

  it('propagates other database errors', async () => {
    const updateOne = vi.fn(async () => {
      throw new Error('not primary')
    })

    await expect(createRepository(updateOne).upsertFromEvent(event)).rejects.toThrow('not primary')
  })
})
