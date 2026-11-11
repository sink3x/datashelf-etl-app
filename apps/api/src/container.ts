import { AirflowClient } from '@clients/airflow-client/airflow-client'
import { MongodbConnection } from '@clients/mongodb-connection/mongodb-connection'
import { createS3Client } from '@clients/s3-client/s3-client'
import type { IAppConfig } from '@config/config'
import { AirflowController } from '@controllers/airflow-controller/airflow-controller'
import { DatasetController } from '@controllers/dataset-controller/dataset-controller'
import { HealthController } from '@controllers/health-controller/health-controller'
import { CHARTS_COMPUTED_EVENT_TYPE } from '@datashelf/contracts'
import { createChartsComputedHandler } from '@messaging/charts-computed-handler'
import { RabbitmqConsumer } from '@messaging/rabbitmq-consumer'
import { createChartResultModel } from '@models/chart-result-model/chart-result-model'
import { ChartResultRepository } from '@repositories/chart-result-repository/chart-result-repository'
import { RawDatasetRepository } from '@repositories/raw-dataset-repository/raw-dataset-repository'
import { AirflowService } from '@services/airflow-service/airflow-service'
import { DatasetService } from '@services/dataset-service/dataset-service'
import { HealthService } from '@services/health-service/health-service'
import type { TLogger } from '@shared/logger'

import { createApp } from './app'

// Composition root: every dependency is constructed here and nothing connects until bootstrap.
export const createContainer = (config: IAppConfig, logger: TLogger) => {
  const mongodb = new MongodbConnection({ uri: config.mongodb.uri, dbName: config.mongodb.dbName, logger })
  const s3Client = createS3Client(config.s3)
  const airflowClient = new AirflowClient({
    baseUrl: config.airflow.url,
    username: config.airflow.username,
    password: config.airflow.password,
    logger,
  })

  const chartResultRepository = new ChartResultRepository(createChartResultModel(mongodb.connection))
  const rawDatasetRepository = new RawDatasetRepository(s3Client, {
    bucket: config.s3.bucket,
    prefix: config.s3.rawPrefix,
  })

  const consumer = new RabbitmqConsumer({
    url: config.rabbitmq.url,
    prefetch: config.rabbitmq.prefetch,
    topology: {
      exchange: config.rabbitmq.exchange,
      routingKey: CHARTS_COMPUTED_EVENT_TYPE,
      queue: config.rabbitmq.queue,
      deadLetterExchange: `${config.rabbitmq.exchange}.dlx`,
      deadLetterQueue: `${config.rabbitmq.queue}.dlq`,
    },
    handler: createChartsComputedHandler({ repository: chartResultRepository, logger }),
    logger,
  })

  const airflowService = new AirflowService({
    airflowClient,
    rawDatasetRepository,
    rawPrefix: config.s3.rawPrefix,
    allowedDagId: config.airflow.dagId,
  })
  const datasetService = new DatasetService({ chartResultRepository, rawDatasetRepository })
  const healthService = new HealthService({
    mongodb: () => mongodb.ping(),
    rabbitmq: () => {
      if (!consumer.isReady()) {
        throw new Error('rabbitmq consumer is not ready')
      }
    },
    s3: (signal) => rawDatasetRepository.ping(signal),
  })

  const app = createApp({
    logger,
    corsOrigins: config.corsOrigins,
    maxUploadSizeBytes: config.upload.maxSizeBytes,
    maxUploadSizeMb: config.upload.maxSizeMb,
    airflowController: new AirflowController(airflowService),
    datasetController: new DatasetController(datasetService),
    healthController: new HealthController(healthService),
  })

  return {
    app,
    mongodb,
    s3Client,
    consumer,
    chartResultRepository,
    healthService,
  }
}

export type TContainer = ReturnType<typeof createContainer>
