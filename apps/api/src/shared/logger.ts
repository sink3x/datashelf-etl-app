import type { IAppConfig } from '@config/config'
import pino from 'pino'
import type { Logger } from 'pino'

export type TLogger = Logger

const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.secretAccessKey',
  '*.accessKeyId',
  '*.access_token',
]

export const createLogger = (config: Pick<IAppConfig, 'logLevel' | 'env'>): TLogger =>
  pino({
    level: config.logLevel,
    base: { service: 'datashelf-api', env: config.env },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
    formatters: {
      level: (label) => ({ level: label }),
    },
  })
