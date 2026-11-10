import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createTestApp } from '../helpers'

describe('health endpoints', () => {
  it('reports liveness and the legacy healthcheck', async () => {
    const { app } = createTestApp()

    expect((await request(app).get('/healthz')).body).toEqual({ status: 'ok' })
    expect((await request(app).get('/api/healthcheck')).body).toEqual({ status: 'alive' })
  })

  it('returns 503 when a dependency is down', async () => {
    const { app } = createTestApp({
      readiness: async () => ({ status: 'not_ready', checks: { mongodb: 'up', rabbitmq: 'down', s3: 'up' } }),
    })

    const response = await request(app).get('/readyz')

    expect(response.status).toBe(503)
    expect(response.body.checks.rabbitmq).toBe('down')
  })

  it('returns 200 when every dependency is up', async () => {
    const response = await request(createTestApp().app).get('/readyz')

    expect(response.status).toBe(200)
  })

  it('echoes a valid incoming request id and generates one otherwise', async () => {
    const { app } = createTestApp()

    expect((await request(app).get('/healthz').set('x-request-id', 'req-123')).headers['x-request-id']).toBe(
      'req-123',
    )
    expect((await request(app).get('/healthz')).headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })
})
