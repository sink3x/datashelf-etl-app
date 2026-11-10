import { S3Client } from '@aws-sdk/client-s3'
import type { IDIContainer } from '@interfaces/DI-container'

export class S3Service {
  private appConfig
  
  public client
  public config

  constructor(container: IDIContainer) {
    const { config: appConfig } = container

    this.appConfig = appConfig
    this.config = appConfig.services.s3

    const { regionName, url, keyId, keyValue } = this.config

    this.client = new S3Client({
      region: regionName,
      endpoint: url,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: keyValue,
      },
    })
  }
}
