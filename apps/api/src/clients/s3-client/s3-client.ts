import { S3Client } from '@aws-sdk/client-s3'
import type { IAppConfig } from '@config/config'

export const createS3Client = (config: IAppConfig['s3']) =>
  new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    maxAttempts: 3,
    requestHandler: {
      connectionTimeout: 5_000,
      requestTimeout: 30_000,
    },
  })
