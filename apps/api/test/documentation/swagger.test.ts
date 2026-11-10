import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { buildSwaggerSpecification } from '../../src/documentation/swagger.utils'
import { createTestApp } from '../helpers'

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

describe('swagger ui', () => {
  it('serves the UI, its assets and the generated specification', async () => {
    const { app } = createTestApp({ overrides: { enableDocs: true } })

    const page = await request(app).get('/docs/')

    expect(page.status).toBe(200)
    expect(page.headers['content-type']).toContain('text/html')

    const init = await request(app).get('/docs/swagger-ui-init.js')

    expect(init.status).toBe(200)
    expect(init.text).toContain('/healthz')

    expect((await request(app).get('/docs/swagger-ui.css')).status).toBe(200)
  })
})
