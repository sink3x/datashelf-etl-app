import type { TChart } from '@datashelf/contracts'
import type { IBucketObject } from '@interfaces/bucket-object'
import type {
  IChartResultRepository,
  TChartResultRecord,
} from '@repositories/chart-result-repository/chart-result-repository'
import type { IRawDatasetRepository } from '@repositories/raw-dataset-repository/raw-dataset-repository'

export interface IProcessedDataset {
  id: string
  filename: string
  processed_at: string
  processing_time_sec: number
  meta: Record<string, unknown>
  chart: TChart[]
  run_id: string
  job: string
  createdAt?: string
  updatedAt?: string
}

export interface IRawDatasetPage {
  items: IBucketObject[]
  totalCount: number
  totalPages: number
  truncated: boolean
}

export interface IDatasetService {
  listProcessed(): Promise<IProcessedDataset[]>
  listRaw(params: { page: number; limit: number }): Promise<IRawDatasetPage>
  getCharts(filename: string): Promise<Record<string, TChart[]>>
}

export interface IDatasetServiceDependencies {
  chartResultRepository: Pick<IChartResultRepository, 'findLatest' | 'findByFilename'>
  rawDatasetRepository: Pick<IRawDatasetRepository, 'list'>
}

export const PROCESSED_LIST_LIMIT = 1000

export const toProcessedDataset = (record: TChartResultRecord): IProcessedDataset => ({
  id: record._id.toString(),
  filename: record.dataset.filename,
  processed_at: new Date(record.occurred_at).toISOString(),
  processing_time_sec: record.processing_time_sec,
  meta: record.meta ?? {},
  chart: record.charts,
  run_id: record.run_id,
  job: record.job,
  createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
  updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
})

export const groupChartsByName = (records: Pick<TChartResultRecord, 'charts'>[]) =>
  records.reduce<Record<string, TChart[]>>((accumulator, record) => {
    for (const chart of record.charts ?? []) {
      if (!chart?.name) {
        continue
      }

      accumulator[chart.name] ??= []
      accumulator[chart.name].push(chart)
    }

    return accumulator
  }, {})

export class DatasetService implements IDatasetService {
  constructor(private readonly dependencies: IDatasetServiceDependencies) {}

  public async listProcessed() {
    const records = await this.dependencies.chartResultRepository.findLatest(PROCESSED_LIST_LIMIT)

    return records.map(toProcessedDataset)
  }

  public async listRaw({ page, limit }: { page: number; limit: number }) {
    const { objects, truncated } = await this.dependencies.rawDatasetRepository.list()
    const sorted = objects.toSorted((left, right) => right.lastModified.localeCompare(left.lastModified))
    const offset = (page - 1) * limit

    return {
      items: sorted.slice(offset, offset + limit),
      totalCount: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
      truncated,
    }
  }

  public async getCharts(filename: string) {
    const records = await this.dependencies.chartResultRepository.findByFilename(filename)

    return groupChartsByName(records)
  }
}
