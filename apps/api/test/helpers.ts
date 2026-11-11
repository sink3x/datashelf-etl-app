import { readFileSync } from 'fs'
import path from 'path'

import { vi } from 'vitest'

import type { IAppDependencies } from '../src/app'
import { createApp } from '../src/app'
import { AirflowController } from '../src/controllers/airflow-controller/airflow-controller'
import { DatasetController } from '../src/controllers/dataset-controller/dataset-controller'
import { HealthController } from '../src/controllers/health-controller/health-controller'
import type { IAirflowService } from '../src/services/airflow-service/airflow-service'
import type { IDatasetService } from '../src/services/dataset-service/dataset-service'
import type { IReadinessReport } from '../src/services/health-service/health-service'
import { createLogger } from '../src/shared/logger'

export const silentLogger = createLogger({ logLevel: 'silent', env: 'test' })

const FIXTURES_DIRECTORY = path.resolve(__dirname, '../../../packages/contracts/fixtures')

export const readFixture = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path.join(FIXTURES_DIRECTORY, name), 'utf8'))

export const createAirflowServiceMock = () => ({
  listDags: vi.fn<IAirflowService['listDags']>(),
  triggerProcessing: vi.fn<IAirflowService['triggerProcessing']>(),
  getDagRun: vi.fn<IAirflowService['getDagRun']>(),
})

export const createDatasetServiceMock = () => ({
  listProcessed: vi.fn<IDatasetService['listProcessed']>(),
  listRaw: vi.fn<IDatasetService['listRaw']>(),
  getCharts: vi.fn<IDatasetService['getCharts']>(),
})

export interface ITestAppOptions {
  airflowService?: ReturnType<typeof createAirflowServiceMock>
  datasetService?: ReturnType<typeof createDatasetServiceMock>
  readiness?: () => Promise<IReadinessReport>
  overrides?: Partial<IAppDependencies>
}

export const createTestApp = (options: ITestAppOptions = {}) => {
  const airflowService = options.airflowService ?? createAirflowServiceMock()
  const datasetService = options.datasetService ?? createDatasetServiceMock()
  const readiness =
    options.readiness ?? (async (): Promise<IReadinessReport> => ({ status: 'ready', checks: {} }))

  const app = createApp({
    logger: silentLogger,
    corsOrigins: ['http://localhost:3000'],
    maxUploadSizeBytes: 1024,
    maxUploadSizeMb: 0.001,
    airflowController: new AirflowController(airflowService),
    datasetController: new DatasetController(datasetService),
    healthController: new HealthController({ readiness }),
    enableDocs: false,
    ...options.overrides,
  })

  return { app, airflowService, datasetService }
}
