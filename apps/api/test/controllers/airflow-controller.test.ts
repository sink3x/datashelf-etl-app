import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import type { IDagTriggeredInfo } from '../../src/interfaces/dag'
import { createAirflowServiceMock, createTestApp } from '../helpers'

const CSV = Buffer.from('id,amount\n1,10\n')

describe('POST /api/airflow/process-data', () => {
  let airflowService: ReturnType<typeof createAirflowServiceMock>
  let app: ReturnType<typeof createTestApp>['app']

  beforeEach(() => {
    airflowService = createAirflowServiceMock()
    app = createTestApp({ airflowService }).app
  })

  it('rejects a request without a file', async () => {
    const response = await request(app).post('/api/airflow/process-data').field('dagId', 'customer_data_etl')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'File not uploaded or not correct', code: 'FILE_REQUIRED' })
    expect(airflowService.triggerProcessing).not.toHaveBeenCalled()
  })

  it('rejects a file over the size limit', async () => {
    const response = await request(app)
      .post('/api/airflow/process-data')
      .field('dagId', 'customer_data_etl')
      .attach('file', Buffer.alloc(2048, 'a'), { filename: 'big.csv', contentType: 'text/csv' })

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('FILE_TOO_LARGE')
    expect(response.body.message).toMatch(/^File size limit exceeded/)
    expect(airflowService.triggerProcessing).not.toHaveBeenCalled()
  })

  it('rejects a file with a disallowed type', async () => {
    const response = await request(app)
      .post('/api/airflow/process-data')
      .field('dagId', 'customer_data_etl')
      .attach('file', Buffer.from('MZ'), { filename: 'tool.exe', contentType: 'application/octet-stream' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'File type application/octet-stream is not allowed',
      code: 'UNSUPPORTED_FILE_TYPE',
    })
  })

  it('rejects more than one file', async () => {
    const response = await request(app)
      .post('/api/airflow/process-data')
      .field('dagId', 'customer_data_etl')
      .attach('file', CSV, { filename: 'a.csv', contentType: 'text/csv' })
      .attach('file', CSV, { filename: 'b.csv', contentType: 'text/csv' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Allowed only 1 file upload')
  })

  it('rejects a missing dagId', async () => {
    const response = await request(app)
      .post('/api/airflow/process-data')
      .attach('file', CSV, { filename: 'data.csv', contentType: 'text/csv' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({ message: 'Dag ID not provided', code: 'VALIDATION_ERROR' })
    expect(response.body.details).toEqual([
      { location: 'body', path: 'dagId', message: 'Dag ID not provided' },
    ])
  })

  it('rejects a dagId that could escape the Airflow path', async () => {
    const response = await request(app)
      .post('/api/airflow/process-data')
      .field('dagId', '../variables')
      .attach('file', CSV, { filename: 'data.csv', contentType: 'text/csv' })

    expect(response.status).toBe(400)
    expect(airflowService.triggerProcessing).not.toHaveBeenCalled()
  })

  it('uploads the file and triggers the DAG', async () => {
    const triggered = { dag_id: 'customer_data_etl', dag_run_id: 'manual__1' } as IDagTriggeredInfo

    airflowService.triggerProcessing.mockResolvedValue(triggered)

    const response = await request(app)
      .post('/api/airflow/process-data')
      .field('dagId', 'customer_data_etl')
      .attach('file', CSV, { filename: 'data.csv', contentType: 'text/csv' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Dag customer_data_etl triggered', triggeredDagInfo: triggered })
    expect(airflowService.triggerProcessing).toHaveBeenCalledWith({
      dagId: 'customer_data_etl',
      file: expect.objectContaining({ originalname: 'data.csv', mimetype: 'text/csv', buffer: CSV }),
    })
  })
})

describe('airflow read endpoints', () => {
  it('keeps the legacy dag list shape', async () => {
    const airflowService = createAirflowServiceMock()

    airflowService.listDags.mockResolvedValue({
      dags: [{ dag_id: 'customer_data_etl' }] as never,
      total_entries: 1,
    })

    const response = await request(createTestApp({ airflowService }).app).get('/api/airflow/dags')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      dags: [{ dag_id: 'customer_data_etl' }],
      total_entries: 1,
      message: 'Successful get dags',
      meta: { totalCount: 1 },
    })
  })

  it('lists allowed file types', async () => {
    const response = await request(createTestApp().app).get('/api/airflow/allowed-file-type-list')

    expect(response.body).toEqual({
      message: 'Ok',
      allowedFileTypeList: ['application/json', 'text/csv'],
      meta: { totalCount: 2 },
    })
  })

  it('passes dag run identifiers through to the service', async () => {
    const airflowService = createAirflowServiceMock()

    airflowService.getDagRun.mockResolvedValue({ state: 'success' } as never)

    const dagRunId = 'manual__2025-05-26T21:47:12.346117+00:00'
    const response = await request(createTestApp({ airflowService }).app).get(
      `/api/airflow/dag/status/customer_data_etl/${encodeURIComponent(dagRunId)}`,
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Ok', dagStatus: { state: 'success' } })
    expect(airflowService.getDagRun).toHaveBeenCalledWith({ dagId: 'customer_data_etl', dagRunId })
  })
})
