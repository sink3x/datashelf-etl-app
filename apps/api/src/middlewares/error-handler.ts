import { AppError, NotFoundError, ValidationError } from '@errors/app-error'
import type { TLogger } from '@shared/logger'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { MulterError } from 'multer'

export interface IErrorResponseBody {
  message: string
  code: string
  details?: unknown
}

const INTERNAL_ERROR_MESSAGE = 'Internal server error'

const MULTER_ERROR_MESSAGES: Partial<Record<MulterError['code'], string>> = {
  LIMIT_FILE_COUNT: 'Allowed only 1 file upload',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
}

const hasHttpStatus = (error: unknown): error is { status: number; type?: string; expose?: boolean } =>
  typeof error === 'object' && error !== null && typeof (error as { status?: unknown }).status === 'number'

export const toAppError = (error: unknown, options: { maxUploadSizeMb?: number } = {}): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const limit = options.maxUploadSizeMb ? `, allowed only ${options.maxUploadSizeMb}mb` : ''

      return new ValidationError(`File size limit exceeded${limit}`, { code: 'FILE_TOO_LARGE', cause: error })
    }

    return new ValidationError(MULTER_ERROR_MESSAGES[error.code] ?? error.message, {
      code: error.code,
      cause: error,
    })
  }

  if (hasHttpStatus(error) && error.status >= 400 && error.status < 500) {
    if (error.type === 'entity.parse.failed') {
      return new ValidationError('Malformed JSON body', { code: 'INVALID_JSON', cause: error })
    }

    if (error.type === 'entity.too.large') {
      return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large', { cause: error })
    }

    return new AppError(error.status, 'BAD_REQUEST', 'Bad request', { cause: error })
  }

  return new AppError(500, 'INTERNAL_ERROR', INTERNAL_ERROR_MESSAGE, { cause: error })
}

export const createErrorHandler =
  (logger: TLogger, options: { maxUploadSizeMb?: number } = {}): ErrorRequestHandler =>
  (error, request, response, next) => {
    if (response.headersSent) {
      return next(error)
    }

    const appError = toAppError(error, options)
    const log = request.log ?? logger

    if (appError.statusCode >= 500) {
      log.error({ err: error, code: appError.code }, appError.message)
    } else {
      log.warn({ code: appError.code, statusCode: appError.statusCode }, appError.message)
    }

    const body: IErrorResponseBody = {
      message: appError.message,
      code: appError.code,
    }

    if (appError.details !== undefined) {
      body.details = appError.details
    }

    response.status(appError.statusCode).json(body)
  }

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new NotFoundError('Requested endpoint not found', { code: 'ROUTE_NOT_FOUND' }))
}
