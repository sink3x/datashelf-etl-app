import type { MongodbService } from '@services/mongodb/mongodb-service'
import type { RabbitmqService } from '@services/rabbitmq/rabbitmq-service'
import type { AirflowService } from 'services/airflow/airflow-service'
import type { S3Service } from 'services/s3/s3-service'

import type { IObjectAny } from './object-any'

export interface IAppConfig {
  server: {
    protocol: string
    host: string
    port: number
  }
  services: {
    airflow: {
      username: string
      password: string
      url: string
    }
    s3: {
      url: string
      keyId: string
      keyValue: string
      bucketName: string
      regionName: string
    }
    mongodb: {
      uri: string
      parameters: IObjectAny
    }
    rabbitmq: {
      url: string
      queue: string
    }
  }
  vars: {
    intervalToUpdateAirflowAccessToken: number
    intervalToCheckRabbitAndMongoStatus: number
    s3RawDataDirectory: string
    s3MaxFileSizeUploadMb: number
  }
}

export type TAppServices = {
  airflow: AirflowService
  s3: S3Service
  mongodb: MongodbService
  rabbitmq: RabbitmqService
}
