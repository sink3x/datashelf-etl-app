import { describe, expect, it, vi } from 'vitest'

import { ValidationError } from '../../src/errors/app-error'
import { AirflowService } from '../../src/services/airflow-service/airflow-service'
import { buildRawObjectKey } from '../../src/services/airflow-service/airflow-service.utils'

const NOW = new Date('2025-06-01T10:15:00.000Z')

const createService = () => {
  const request = vi.fn(async () => ({ dag_run_id: 'manual__1' }))
  const put = vi.fn(async () => undefined)
  const service = new AirflowService({
    airflowClient: { request } as never,
    rawDatasetRepository: { put },
    rawPrefix: 'raw-data',
    allowedDagId: 'customer_data_etl',
    now: () => NOW,
  })

  return { service, request, put }
}

const file = {
  originalname: 'Retail Sales.csv',
  mimetype: 'text/csv',
  size: 3,
  buffer: Buffer.from('a,b'),
}

describe('AirflowService.triggerProcessing', () => {
  it('stores the file under the raw prefix and triggers the DAG with its object key', async () => {
    const { service, request, put } = createService()

    await service.triggerProcessing({ dagId: 'customer_data_etl', file })

    const objectKey = 'raw-data/Retail_Sales-1748772900.csv'

    expect(put).toHaveBeenCalledWith({ key: objectKey, body: file.buffer, contentType: 'text/csv' })
    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v2/dags/customer_data_etl/dagRuns',
      data: { logical_date: NOW.toISOString(), conf: { object_key: objectKey } },
    })
    expect(put.mock.invocationCallOrder[0]).toBeLessThan(request.mock.invocationCallOrder[0])
  })

  it('refuses to trigger DAGs other than the configured one', async () => {
    const { service, request, put } = createService()

    await expect(service.triggerProcessing({ dagId: 'other_dag', file })).rejects.toBeInstanceOf(
      ValidationError,
    )
    expect(put).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
  })

  it('encodes dag run ids in the Airflow path', async () => {
    const { service, request } = createService()

    await service.getDagRun({ dagId: 'customer_data_etl', dagRunId: 'manual__2025-05-26T21:47:12+00:00' })

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v2/dags/customer_data_etl/dagRuns/manual__2025-05-26T21%3A47%3A12%2B00%3A00',
    })
  })
})

describe('buildRawObjectKey', () => {
  it.each([
    ['data.json', 'raw-data/data-1748772900.json'],
    ['../../etc/passwd', 'raw-data/passwd-1748772900'],
    ['.hidden.csv', 'raw-data/hidden-1748772900.csv'],
    ['отчёт.csv', 'raw-data/dataset-1748772900.csv'],
  ])('sanitises %s', (name, expected) => {
    expect(buildRawObjectKey('raw-data', name, NOW)).toBe(expected)
  })
})
