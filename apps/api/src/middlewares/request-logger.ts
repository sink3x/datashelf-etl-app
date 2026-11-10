import { randomUUID } from 'crypto'

import type { TLogger } from '@shared/logger'
import { pinoHttp } from 'pino-http'

const REQUEST_ID_HEADER = 'x-request-id'
const REQUEST_ID_PATTERN = /^[\w.:-]{1,128}$/
const QUIET_PATHS = new Set(['/healthz', '/readyz', '/api/healthcheck'])

export const createRequestLogger = (logger: TLogger) =>
  pinoHttp({
    logger,
    genReqId: (request, response) => {
      const incomingId = request.headers[REQUEST_ID_HEADER]
      const requestId =
        typeof incomingId === 'string' && REQUEST_ID_PATTERN.test(incomingId) ? incomingId : randomUUID()

      response.setHeader(REQUEST_ID_HEADER, requestId)

      return requestId
    },
    autoLogging: {
      ignore: (request) => QUIET_PATHS.has(request.url?.split('?')[0] ?? ''),
    },
    customLogLevel: (_request, response, error) => {
      if (error || response.statusCode >= 500) {
        return 'error'
      }

      return response.statusCode >= 400 ? 'warn' : 'info'
    },
    serializers: {
      req: (request) => ({
        id: request.id,
        method: request.method,
        url: request.url,
      }),
      res: (response) => ({
        statusCode: response.statusCode,
      }),
    },
  })
