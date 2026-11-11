export interface IAppErrorOptions {
  details?: unknown
  cause?: unknown
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(statusCode: number, code: string, message: string, options: IAppErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = new.target.name
    this.statusCode = statusCode
    this.code = code
    this.details = options.details
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: IAppErrorOptions & { code?: string } = {}) {
    super(400, options.code ?? 'VALIDATION_ERROR', message, options)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options: IAppErrorOptions & { code?: string } = {}) {
    super(404, options.code ?? 'NOT_FOUND', message, options)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options: IAppErrorOptions = {}) {
    super(409, 'CONFLICT', message, options)
  }
}

export class UpstreamError extends AppError {
  constructor(message: string, options: IAppErrorOptions & { code?: string } = {}) {
    super(502, options.code ?? 'UPSTREAM_ERROR', message, options)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', options: IAppErrorOptions = {}) {
    super(503, 'SERVICE_UNAVAILABLE', message, options)
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError
