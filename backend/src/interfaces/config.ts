import type { AirflowService } from 'services/airflow/airflow-service'
import type { S3Service } from 'services/s3/s3-service'

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
  }
  vars: {
    intervalToUpdateAirflowAccessToken: number
    s3RawDataDirectory: string
  }
}

export type TAppServices = {
  airflow: AirflowService
  s3: S3Service
}
