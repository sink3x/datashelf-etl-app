import { describe, expect, it } from 'vitest'

import { ConfigError, parseConfig } from '../../src/config/config'

const validEnv = {
  MONGODB_URI: 'mongodb://localhost:27017',
  RABBITMQ_URL: 'amqp://localhost:5672',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_BUCKET: 'datashelf',
  S3_ACCESS_KEY_ID: 'minioadmin',
  S3_SECRET_ACCESS_KEY: 'super-secret-value',
  AIRFLOW_URL: 'http://localhost:8080/',
  AIRFLOW_USERNAME: 'airflow',
  AIRFLOW_PASSWORD: 'airflow-password',
}

describe('parseConfig', () => {
  it('applies documented defaults', () => {
    const config = parseConfig(validEnv)

    expect(config).toMatchObject({
      env: 'development',
      isProduction: false,
      port: 5000,
      logLevel: 'info',
      corsOrigins: ['*'],
      mongodb: { dbName: 'datashelf' },
      rabbitmq: { exchange: 'datashelf.events', queue: 'datashelf.api.charts-computed', prefetch: 10 },
      s3: { region: 'ru-central1', forcePathStyle: false, rawPrefix: 'raw-data' },
      upload: { maxSizeMb: 10, maxSizeBytes: 10 * 1024 * 1024 },
      airflow: { url: 'http://localhost:8080', dagId: 'customer_data_etl' },
    })
  })

  it('parses typed values from strings', () => {
    const config = parseConfig({
      ...validEnv,
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ORIGINS: 'https://a.example, https://b.example ,',
      RABBITMQ_PREFETCH: '25',
      S3_FORCE_PATH_STYLE: 'true',
      S3_RAW_PREFIX: '/uploads/',
      UPLOAD_MAX_SIZE_MB: '2',
    })

    expect(config.isProduction).toBe(true)
    expect(config.port).toBe(8080)
    expect(config.corsOrigins).toEqual(['https://a.example', 'https://b.example'])
    expect(config.rabbitmq.prefetch).toBe(25)
    expect(config.s3.forcePathStyle).toBe(true)
    expect(config.s3.rawPrefix).toBe('uploads')
    expect(config.upload.maxSizeBytes).toBe(2 * 1024 * 1024)
  })

  it('treats "false" as false for boolean flags', () => {
    expect(parseConfig({ ...validEnv, S3_FORCE_PATH_STYLE: 'false' }).s3.forcePathStyle).toBe(false)
  })

  it('fails fast with every missing variable listed', () => {
    expect(() => parseConfig({})).toThrow(ConfigError)

    try {
      parseConfig({})
    } catch (error) {
      const { message } = error as ConfigError

      for (const name of ['MONGODB_URI', 'RABBITMQ_URL', 'S3_BUCKET', 'AIRFLOW_PASSWORD']) {
        expect(message).toContain(name)
      }
    }
  })

  it('rejects malformed values without echoing them', () => {
    let message = ''

    try {
      parseConfig({
        ...validEnv,
        PORT: 'not-a-port',
        S3_ENDPOINT: 'super-secret-value',
        S3_FORCE_PATH_STYLE: 'maybe',
      })
    } catch (error) {
      message = (error as Error).message
    }

    expect(message).toContain('PORT')
    expect(message).toContain('S3_ENDPOINT')
    expect(message).toContain('S3_FORCE_PATH_STYLE')
    expect(message).not.toContain('super-secret-value')
  })
})
