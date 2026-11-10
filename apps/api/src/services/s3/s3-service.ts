import { S3Client } from '@aws-sdk/client-s3'
import type { IDIContainer } from '@interfaces/DI-container'

export class S3Service {
  private appConfig

  public client
  public config

  constructor(container: IDIContainer) {
    const { config: appConfig } = container

    this.appConfig = appConfig
    this.config = appConfig.s3

    const { region, endpoint, accessKeyId, secretAccessKey, forcePathStyle } = this.config

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }
}
