import type { AirflowService } from '@services/airflow/airflow-service'
import type { MongodbService } from '@services/mongodb/mongodb-service'
import type { RabbitmqService } from '@services/rabbitmq/rabbitmq-service'
import type { S3Service } from '@services/s3/s3-service'

export type TAppServices = {
  airflow: AirflowService
  s3: S3Service
  mongodb: MongodbService
  rabbitmq: RabbitmqService
}
