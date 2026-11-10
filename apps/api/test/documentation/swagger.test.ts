import { describe, expect, it } from 'vitest'

import { buildSwaggerSpecification } from '../../src/documentation/swagger.utils'

describe('openapi documentation', () => {
  it('collects every router documentation file', () => {
    const specification = buildSwaggerSpecification()

    expect(Object.keys(specification.paths)).toEqual(
      expect.arrayContaining([
        '/api/healthcheck',
        '/api/airflow/dags',
        '/api/airflow/process-data',
        '/api/dataset/processed',
        '/api/dataset/raw',
        '/healthz',
        '/readyz',
      ]),
    )
  })
})
