import { ConflictError, NotFoundError, UpstreamError, ValidationError } from '@errors/app-error'
import type { AppError } from '@errors/app-error'
import type { TLogger } from '@shared/logger'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios, { isAxiosError } from 'axios'

export interface IAirflowClientOptions {
  baseUrl: string
  username: string
  password: string
  logger: TLogger
  timeoutMs?: number
  httpClient?: AxiosInstance
  now?: () => number
}

interface ICachedToken {
  value: string
  expiresAt: number
}

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_TOKEN_TTL_MS = 15 * 60 * 1000
const TOKEN_EXPIRY_SKEW_MS = 60 * 1000

export const readJwtExpiry = (token: string): number | null => {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: unknown }

    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

const readDetail = (data: unknown): string | null => {
  if (typeof data === 'object' && data !== null && typeof (data as { detail?: unknown }).detail === 'string') {
    return (data as { detail: string }).detail
  }

  return null
}

export const toAirflowError = (error: unknown): AppError => {
  if (!isAxiosError(error)) {
    return new UpstreamError('Airflow request failed', { code: 'AIRFLOW_UNAVAILABLE', cause: error })
  }

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

    return new UpstreamError(isTimeout ? 'Airflow request timed out' : 'Airflow is unreachable', {
      code: isTimeout ? 'AIRFLOW_TIMEOUT' : 'AIRFLOW_UNAVAILABLE',
      cause: error,
    })
  }

  const { status, data } = error.response
  const detail = readDetail(data)

  if (status === 404) {
    return new NotFoundError(detail ?? 'Airflow resource not found', { code: 'AIRFLOW_NOT_FOUND', cause: error })
  }

  if (status === 409) {
    return new ConflictError(detail ?? 'Airflow reported a conflict', { cause: error })
  }

  if (status === 400 || status === 422) {
    return new ValidationError(detail ?? 'Airflow rejected the request', {
      code: 'AIRFLOW_REJECTED_REQUEST',
      details: detail ? undefined : (data as { detail?: unknown })?.detail,
      cause: error,
    })
  }

  return new UpstreamError(detail ?? `Airflow responded with status ${status}`, {
    code: 'AIRFLOW_ERROR',
    cause: error,
  })
}

export class AirflowClient {
  private readonly http: AxiosInstance
  private readonly logger: TLogger
  private readonly now: () => number
  private token: ICachedToken | null = null
  private tokenRequest: Promise<string> | null = null

  constructor(private readonly options: IAirflowClientOptions) {
    this.http =
      options.httpClient ??
      axios.create({ baseURL: options.baseUrl, timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS })
    this.logger = options.logger.child({ component: 'airflow-client' })
    this.now = options.now ?? Date.now
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      return await this.send<T>(config, await this.getToken())
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) {
        throw toAirflowError(error)
      }

      this.logger.info('airflow token rejected, refreshing')
      this.token = null

      try {
        return await this.send<T>(config, await this.getToken())
      } catch (retryError) {
        throw toAirflowError(retryError)
      }
    }
  }

  private async send<T>(config: AxiosRequestConfig, token: string) {
    const response = await this.http.request<T>({
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    })

    return response.data
  }

  private async getToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) {
      return this.token.value
    }

    this.tokenRequest ??= this.fetchToken().finally(() => {
      this.tokenRequest = null
    })

    return this.tokenRequest
  }

  private async fetchToken() {
    try {
      const { data } = await this.http.post<{ access_token?: string }>('/auth/token', {
        username: this.options.username,
        password: this.options.password,
      })

      if (!data?.access_token) {
        throw new UpstreamError('Airflow returned no access token', { code: 'AIRFLOW_AUTH_FAILED' })
      }

      const expiresAt = readJwtExpiry(data.access_token) ?? this.now() + DEFAULT_TOKEN_TTL_MS

      this.token = { value: data.access_token, expiresAt: expiresAt - TOKEN_EXPIRY_SKEW_MS }

      return data.access_token
    } catch (error) {
      if (error instanceof UpstreamError) {
        throw error
      }

      this.logger.error({ status: isAxiosError(error) ? error.response?.status : undefined }, 'airflow auth failed')

      throw new UpstreamError('Failed to authenticate with Airflow', { code: 'AIRFLOW_AUTH_FAILED', cause: error })
    }
  }
}
