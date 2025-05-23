import { PutObjectCommand } from '@aws-sdk/client-s3'
import type { IAppConfig } from '@interfaces/config'
import type { IDIContainer } from '@interfaces/DI-container'
import axios from 'axios'
import type { Request } from 'express'
import { DateTime } from 'luxon'

import { ALLOWLABLE_FILE_TYPE_LIST } from './airflow-controller.constants'
import type {
  TGetAllowFileTypeListResponse,
  TGetDagListAirflowRequest,
  TGetDagListAirflowResponse,
  TGetDagListResponse,
  TProcessDataRequest,
  TProcessDataResponse,
} from './airflow-controller.interfaces'

export class AirflowController {
  private config: IAppConfig
  private s3
  private airflow

  constructor(container: IDIContainer) {
    const { config, services } = container

    this.config = config
    this.s3 = services.s3
    this.airflow = services.airflow
  }

  public async getDagList(_request: Request, response: TGetDagListResponse) {
    try {
      const { data } = await axios<TGetDagListAirflowRequest, TGetDagListAirflowResponse>(
        `${this.config.services.airflow.url}/api/v2/dags`,
        {
          headers: {
            ...this.airflow.apiHeaders,
          },
        },
      )

      response.status(200).json({
        dags: data.dags,
        total_entries: data.total_entries,
        message: 'Successful get dags',
      })
    } catch (error) {
      const axiosErrorData = error?.response?.data
      const { detail = 'Failed to get dags' } = axiosErrorData || {}

      response.status(500).json({
        message: detail,
        info: axiosErrorData,
      })
    }
  }

  public async processData(request: TProcessDataRequest, response: TProcessDataResponse) {
    try {
      const { file, body } = request
      const { dagId } = body

      if (!file) {
        return response.status(400).json({
          message: 'File not uploaded or uploaded not correct',
        })
      }

      if (!dagId) {
        return response.status(400).json({
          message: 'Dag ID not provided',
        })
      }

      if (!ALLOWLABLE_FILE_TYPE_LIST.includes(file.mimetype)) {
        return response.status(400).json({ message: `File type ${file.mimetype} is not allowed` })
      }

      const fileExtension = file.originalname.split('.').at(-1) || ''
      const { s3RawDataDirectory } = this.config.vars
      const fileObjectKey = `${s3RawDataDirectory}/${file.originalname.replace(`.${fileExtension}`, '')}-${DateTime.now().toUnixInteger()}.${fileExtension}`

      await this.s3.client.send(
        new PutObjectCommand({
          Bucket: this.config.services.s3.bucketName,
          Key: fileObjectKey,
          Body: file.buffer,
        }),
      )

      const { data } = await axios.post(
        `${this.config.services.airflow.url}/api/v2/dags/${dagId}/dagRuns`,
        {
          logical_date: DateTime.now(),
          conf: {
            object_key: fileObjectKey,
          },
        },
        {
          headers: {
            ...this.airflow.apiHeaders,
          },
        },
      )

      response.status(200).json({
        message: `Dag ${dagId} triggered`,
        triggeredDagInfo: data,
      })
    } catch (error) {
      const axiosErrorData = error?.response?.data
      const { detail = 'Failed to process data' } = axiosErrorData || {}

      response.status(500).json({
        message: detail,
        info: axiosErrorData,
      })
    }
  }

  public getAllowFileTypeList(_request: Request, response: TGetAllowFileTypeListResponse) {
    response.status(200).json({
      message: 'Ok',
      allowedFileTypeList: ALLOWLABLE_FILE_TYPE_LIST,
    })
  }
}
