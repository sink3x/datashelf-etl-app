import type { AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { AirflowClient, readJwtExpiry } from '../../src/clients/airflow-client/airflow-client'
import { NotFoundError, UpstreamError } from '../../src/errors/app-error'
import { silentLogger } from '../helpers'

const axiosError = (status?: number, data?: unknown, code?: string) =>
  Object.assign(new Error('request failed'), {
    isAxiosError: true,
    code,
    response: status ? { status, data } : undefined,
  })

const jwt = (exp: number) => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`

const createClient = (http: { post: ReturnType<typeof vi.fn>; request: ReturnType<typeof vi.fn> }, now = 0) =>
  new AirflowClient({
    baseUrl: 'http://airflow',
    username: 'user',
    password: 'pass',
    logger: silentLogger,
    httpClient: http as unknown as AxiosInstance,
    now: () => now,
  })

describe('AirflowClient', () => {
  it('fetches the token lazily once and reuses it', async () => {
    const http = {
      post: vi.fn(async () => ({ data: { access_token: 'token-1' } })),
      request: vi.fn(async () => ({ data: { ok: true } })),
    }
    const client = createClient(http)

    expect(http.post).not.toHaveBeenCalled()

    await Promise.all([client.request({ url: '/a' }), client.request({ url: '/b' })])

    expect(http.post).toHaveBeenCalledOnce()
    expect(http.post).toHaveBeenCalledWith('/auth/token', { username: 'user', password: 'pass' })
    expect(http.request).toHaveBeenCalledWith({ url: '/a', headers: { Authorization: 'Bearer token-1' } })
  })

  it('refreshes the token and retries once on 401', async () => {
    const http = {
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { access_token: 'stale' } })
        .mockResolvedValueOnce({ data: { access_token: 'fresh' } }),
      request: vi.fn().mockRejectedValueOnce(axiosError(401)).mockResolvedValueOnce({ data: 'ok' }),
    }

    await expect(createClient(http).request({ url: '/a' })).resolves.toBe('ok')
    expect(http.post).toHaveBeenCalledTimes(2)
    expect(http.request).toHaveBeenLastCalledWith({ url: '/a', headers: { Authorization: 'Bearer fresh' } })
  })

  it('refreshes an expired token before the request', async () => {
    const http = {
      post: vi.fn(async () => ({ data: { access_token: jwt(30) } })),
      request: vi.fn(async () => ({ data: 'ok' })),
    }
    const client = createClient(http)

    await client.request({ url: '/a' })
    await client.request({ url: '/b' })

    // exp=30s minus the 60s safety skew is already in the past, so every call re-authenticates
    expect(http.post).toHaveBeenCalledTimes(2)
    expect(readJwtExpiry(jwt(30))).toBe(30_000)
  })

  it('maps Airflow 404 to NotFoundError with the upstream detail', async () => {
    const http = {
      post: vi.fn(async () => ({ data: { access_token: 'token' } })),
      request: vi.fn().mockRejectedValue(axiosError(404, { detail: 'DAG not found' })),
    }

    const error = await createClient(http)
      .request<never>({ url: '/a' })
      .catch((reason: unknown) => reason as UpstreamError)

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.message).toBe('DAG not found')
  })

  it('maps timeouts and auth failures to upstream errors', async () => {
    const timeoutHttp = {
      post: vi.fn(async () => ({ data: { access_token: 'token' } })),
      request: vi.fn().mockRejectedValue(axiosError(undefined, undefined, 'ECONNABORTED')),
    }

    await expect(createClient(timeoutHttp).request({ url: '/a' })).rejects.toMatchObject({
      code: 'AIRFLOW_TIMEOUT',
      statusCode: 502,
    })

    const authHttp = { post: vi.fn().mockRejectedValue(axiosError(403)), request: vi.fn() }
    const error = await createClient(authHttp)
      .request<never>({ url: '/a' })
      .catch((reason: unknown) => reason as UpstreamError)

    expect(error).toBeInstanceOf(UpstreamError)
    expect(error.code).toBe('AIRFLOW_AUTH_FAILED')
    expect(authHttp.request).not.toHaveBeenCalled()
  })
})
