import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import type { IBucketObject } from '@interfaces/bucket-object'
import type { IDIContainer } from '@interfaces/DI-container'

import type {
  IGetProcessedRequest,
  IGetProcessedResponse,
  IGetRawRequest,
  IGetRawResponse,
  TDatasetProcessedDocument,
} from './dataset-controller.interfaces'

export class DatasetController {
  private mongodb
  private s3

  constructor(container: IDIContainer) {
    const { services } = container
    const { mongodb, s3 } = services

    this.mongodb = mongodb
    this.s3 = s3
  }

  public async getProcessed(_request: IGetProcessedRequest, response: IGetProcessedResponse) {
    try {
      const datasetList = (await this.mongodb.models.datasetProcessed.find()) as TDatasetProcessedDocument[]

      response.status(200).json({
        message: 'Ok',
        datasetList,
      })
    } catch (error) {
      const axiosErrorData = error?.response?.data
      const { detail = 'Failed to get processed data' } = axiosErrorData || {}

      response.status(500).json({
        message: detail,
        info: axiosErrorData,
      })
    }
  }

  public async getRaw(_request: IGetRawRequest, response: IGetRawResponse) {
    try {
      const commandGetObjectList = new ListObjectsV2Command({
        Bucket: this.s3.config.bucketName,
        Prefix: 'raw-data',
      })

      const { Contents } = await this.s3.client.send(commandGetObjectList)
      const fileList: IBucketObject[] = (Contents || [])
        .map((bucketObject) => {
          const { Key, LastModified, Size } = bucketObject
          const fileName = Key?.split('/').at(-1)!

          if (!fileName) {
            return null
          }

          return {
            fileName,
            key: Key,
            lastModified: LastModified!,
            size: Size || 0,
          } as unknown as IBucketObject
        })
        .filter((bucketObject) => bucketObject !== null)

      response.status(200).json({
        message: 'Ok',
        datasetList: fileList,
      })
    } catch (error) {
      const axiosErrorData = error?.response?.data
      const { detail = 'Failed to get processed data' } = axiosErrorData || {}

      response.status(500).json({
        message: detail,
        info: axiosErrorData,
      })
    }
  }
}
