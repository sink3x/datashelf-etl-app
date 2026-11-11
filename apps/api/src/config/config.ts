import { z } from 'zod'

const DEFAULT_DEV_CORS_ORIGIN = '*'

const nonEmpty = z.string().trim().min(1)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: z.string().trim().default(DEFAULT_DEV_CORS_ORIGIN),

  MONGODB_URI: nonEmpty,
  MONGODB_DB: nonEmpty.default('datashelf'),

  RABBITMQ_URL: nonEmpty,
  RABBITMQ_EXCHANGE: nonEmpty.default('datashelf.events'),
  RABBITMQ_QUEUE: nonEmpty.default('datashelf.api.charts-computed'),
  RABBITMQ_PREFETCH: z.coerce.number().int().min(1).max(1000).default(10),

  S3_ENDPOINT: z.url(),
  S3_REGION: nonEmpty.default('ru-central1'),
  S3_BUCKET: nonEmpty,
  S3_ACCESS_KEY_ID: nonEmpty,
  S3_SECRET_ACCESS_KEY: nonEmpty,
  S3_FORCE_PATH_STYLE: z.stringbool().default(false),
  S3_RAW_PREFIX: nonEmpty.default('raw-data'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().positive().max(1024).default(10),

  AIRFLOW_URL: z.url(),
  AIRFLOW_USERNAME: nonEmpty,
  AIRFLOW_PASSWORD: nonEmpty,
  AIRFLOW_DAG_ID: nonEmpty.default('customer_data_etl'),
})

export type TEnv = z.infer<typeof envSchema>

export interface IAppConfig {
  env: TEnv['NODE_ENV']
  isProduction: boolean
  port: number
  logLevel: TEnv['LOG_LEVEL']
  corsOrigins: string[]
  mongodb: {
    uri: string
    dbName: string
  }
  rabbitmq: {
    url: string
    exchange: string
    queue: string
    prefetch: number
  }
  s3: {
    endpoint: string
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    forcePathStyle: boolean
    rawPrefix: string
  }
  upload: {
    maxSizeBytes: number
    maxSizeMb: number
  }
  airflow: {
    url: string
    username: string
    password: string
    dagId: string
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

const stripSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')

const parseCorsOrigins = (value: string) =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export const parseConfig = (source: Record<string, string | undefined>): IAppConfig => {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    throw new ConfigError(`Invalid environment configuration:\n${z.prettifyError(result.error)}`)
  }

  const env = result.data
  const corsOrigins = parseCorsOrigins(env.CORS_ORIGINS)

  return {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    corsOrigins: corsOrigins.length ? corsOrigins : [DEFAULT_DEV_CORS_ORIGIN],
    mongodb: {
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DB,
    },
    rabbitmq: {
      url: env.RABBITMQ_URL,
      exchange: env.RABBITMQ_EXCHANGE,
      queue: env.RABBITMQ_QUEUE,
      prefetch: env.RABBITMQ_PREFETCH,
    },
    s3: {
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      rawPrefix: stripSlashes(env.S3_RAW_PREFIX),
    },
    upload: {
      maxSizeBytes: Math.floor(env.UPLOAD_MAX_SIZE_MB * 1024 * 1024),
      maxSizeMb: env.UPLOAD_MAX_SIZE_MB,
    },
    airflow: {
      url: env.AIRFLOW_URL.replace(/\/+$/, ''),
      username: env.AIRFLOW_USERNAME,
      password: env.AIRFLOW_PASSWORD,
      dagId: env.AIRFLOW_DAG_ID,
    },
  }
}
