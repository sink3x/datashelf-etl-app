import express from 'express'
import { MulterError } from 'multer'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { NotFoundError, UpstreamError, ValidationError } from '../../src/errors/app-error'
import { createErrorHandler, notFoundHandler } from '../../src/middlewares/error-handler'
import { silentLogger } from '../helpers'

const createApp = (failure: () => unknown) => {
  const app = express()

  app.use(express.json())
  app.post('/json', (_request, response) => {
    response.json({ ok: true })
  })
  app.get('/fail', async () => {
    await Promise.resolve()
    throw failure()
  })
  app.use(notFoundHandler)
  app.use(createErrorHandler(silentLogger, { maxUploadSizeMb: 10 }))

  return app
}

describe('error handler', () => {
  it.each([
    [new ValidationError('Dag ID not provided', { details: [{ path: 'dagId' }] }), 400, 'VALIDATION_ERROR'],
    [new NotFoundError('Dag not found'), 404, 'NOT_FOUND'],
    [
      new UpstreamError('Airflow is unreachable', { code: 'AIRFLOW_UNAVAILABLE' }),
      502,
      'AIRFLOW_UNAVAILABLE',
    ],
  ])('renders %s as a JSON error contract', async (error, status, code) => {
    const response = await request(createApp(() => error)).get('/fail')

    expect(response.status).toBe(status)
    expect(response.body).toMatchObject({ message: error.message, code })
  })

  it('includes details only when present', async () => {
    const response = await request(createApp(() => new ValidationError('bad', { details: ['x'] }))).get(
      '/fail',
    )

    expect(response.body.details).toEqual(['x'])
  })

  it('hides unexpected errors behind a generic 500 without a stack trace', async () => {
    const response = await request(createApp(() => new Error('secret connection string'))).get('/fail')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' })
    expect(JSON.stringify(response.body)).not.toContain('secret')
  })

  it('maps multer size errors to a 400 with the legacy message', async () => {
    const response = await request(createApp(() => new MulterError('LIMIT_FILE_SIZE', 'file'))).get('/fail')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'File size limit exceeded, allowed only 10mb',
      code: 'FILE_TOO_LARGE',
    })
  })

  it('rejects malformed JSON bodies', async () => {
    const response = await request(createApp(() => null))
      .post('/json')
      .set('content-type', 'application/json')
      .send('{"broken":')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('INVALID_JSON')
  })

  it('answers unknown routes with 404', async () => {
    const response = await request(createApp(() => null)).get('/missing')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ message: 'Requested endpoint not found', code: 'ROUTE_NOT_FOUND' })
  })
})
