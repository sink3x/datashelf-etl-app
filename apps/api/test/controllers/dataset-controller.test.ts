import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createDatasetServiceMock, createTestApp } from '../helpers'

describe('dataset endpoints', () => {
  it('returns processed datasets with the legacy envelope', async () => {
    const datasetService = createDatasetServiceMock()
    const item = {
      id: 'abc',
      filename: 'retail.csv',
      processed_at: '2025-06-01T10:15:30.000Z',
      processing_time_sec: 0.42,
      meta: {},
      chart: [],
      run_id: 'run',
      job: 'retail_metrics',
    }

    datasetService.listProcessed.mockResolvedValue([item])

    const response = await request(createTestApp({ datasetService }).app).get('/api/dataset/processed')

    expect(response.body).toEqual({ message: 'Ok', datasetList: [item], meta: { totalCount: 1 } })
  })

  it('validates and applies raw pagination', async () => {
    const datasetService = createDatasetServiceMock()

    datasetService.listRaw.mockResolvedValue({ items: [], totalCount: 25, totalPages: 3, truncated: false })

    const response = await request(createTestApp({ datasetService }).app).get(
      '/api/dataset/raw?page=2&limit=10',
    )

    expect(datasetService.listRaw).toHaveBeenCalledWith({ page: 2, limit: 10 })
    expect(response.body).toEqual({
      message: 'Ok',
      datasetList: [],
      meta: { totalCount: 25, totalPages: 3, currentPage: 2, pageSize: 10, truncated: false },
    })
  })

  it('defaults raw pagination and rejects out-of-range values', async () => {
    const datasetService = createDatasetServiceMock()

    datasetService.listRaw.mockResolvedValue({ items: [], totalCount: 0, totalPages: 0, truncated: false })

    const { app } = createTestApp({ datasetService })

    await request(app).get('/api/dataset/raw')
    expect(datasetService.listRaw).toHaveBeenCalledWith({ page: 1, limit: 10 })

    const response = await request(app).get('/api/dataset/raw?limit=5000&page=0')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('VALIDATION_ERROR')
    expect(response.body.details).toHaveLength(2)
  })

  it('returns charts grouped by name for a filename', async () => {
    const datasetService = createDatasetServiceMock()
    const charts = { total_sales: [{ name: 'total_sales', type: 'metric' }] }

    datasetService.getCharts.mockResolvedValue(charts as never)

    const response = await request(createTestApp({ datasetService }).app).get(
      '/api/dataset/charts/retail.csv',
    )

    expect(datasetService.getCharts).toHaveBeenCalledWith('retail.csv')
    expect(response.body).toEqual({ message: 'Ok', charts, meta: { totalCount: 1 } })
  })

  it('surfaces service failures through the error contract', async () => {
    const datasetService = createDatasetServiceMock()

    datasetService.listProcessed.mockRejectedValue(new Error('mongo timeout'))

    const response = await request(createTestApp({ datasetService }).app).get('/api/dataset/processed')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' })
  })
})
