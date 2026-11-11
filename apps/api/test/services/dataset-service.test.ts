import { Types } from 'mongoose'
import { describe, expect, it, vi } from 'vitest'

import type { TChartResultRecord } from '../../src/repositories/chart-result-repository/chart-result-repository'
import { DatasetService } from '../../src/services/dataset-service/dataset-service'

const record = (overrides: Partial<TChartResultRecord> = {}): TChartResultRecord => ({
  _id: new Types.ObjectId('6837f49fd09dabb2e3e39cb4'),
  run_id: 'manual__1',
  job: 'retail_metrics',
  event_id: '4f0d3c1e-8a5b-4b8e-9f43-2d6c1a7e9b10',
  dataset: { object_key: 'raw-data/retail.csv', filename: 'retail.csv' },
  occurred_at: new Date('2025-06-01T10:15:30.000Z'),
  processing_time_sec: 0.42,
  meta: { total_rows: 1000 },
  charts: [{ name: 'total_sales', title: 'Total', description: '', type: 'metric', value: 1 }],
  createdAt: new Date('2025-06-01T10:15:31.000Z'),
  updatedAt: new Date('2025-06-01T10:15:31.000Z'),
  ...overrides,
})

const createService = (records: TChartResultRecord[] = [], objects: { lastModified: string }[] = []) =>
  new DatasetService({
    chartResultRepository: {
      findLatest: vi.fn(async () => records),
      findByFilename: vi.fn(async () => records),
    },
    rawDatasetRepository: {
      list: vi.fn(async () => ({
        objects: objects.map((object, index) => ({
          fileName: `f${index}.csv`,
          key: `raw-data/f${index}.csv`,
          size: 1,
          ...object,
        })),
        truncated: false,
      })),
    },
  })

describe('DatasetService', () => {
  it('maps chart_results documents to the legacy processed item shape', async () => {
    const [item] = await createService([record()]).listProcessed()

    expect(item).toEqual({
      id: '6837f49fd09dabb2e3e39cb4',
      filename: 'retail.csv',
      processed_at: '2025-06-01T10:15:30.000Z',
      processing_time_sec: 0.42,
      meta: { total_rows: 1000 },
      chart: record().charts,
      run_id: 'manual__1',
      job: 'retail_metrics',
      createdAt: '2025-06-01T10:15:31.000Z',
      updatedAt: '2025-06-01T10:15:31.000Z',
    })
  })

  it('groups charts from every job of a dataset by chart name', async () => {
    const charts = await createService([
      record(),
      record({
        job: 'other_job',
        charts: [
          { name: 'total_sales', title: 'Total', description: '', type: 'metric', value: 2 },
          { name: 'monthly', title: 'M', description: '', type: 'line', labels: [], values: [] },
        ],
      }),
    ]).getCharts('retail.csv')

    expect(Object.keys(charts)).toEqual(['total_sales', 'monthly'])
    expect(charts.total_sales).toHaveLength(2)
  })

  it('paginates raw files newest first', async () => {
    const page = await createService(
      [],
      [
        { lastModified: '2025-01-01T00:00:00.000Z' },
        { lastModified: '2025-03-01T00:00:00.000Z' },
        { lastModified: '2025-02-01T00:00:00.000Z' },
      ],
    ).listRaw({ page: 1, limit: 2 })

    expect(page.items.map(({ lastModified }) => lastModified)).toEqual([
      '2025-03-01T00:00:00.000Z',
      '2025-02-01T00:00:00.000Z',
    ])
    expect(page).toMatchObject({ totalCount: 3, totalPages: 2, truncated: false })
  })
})
