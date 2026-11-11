import type { AirflowClient } from '@clients/airflow-client/airflow-client'
import { ValidationError } from '@errors/app-error'
import type { IDagInfo, IDagStatus, IDagTriggeredInfo } from '@interfaces/dag'
import type { IRawDatasetRepository } from '@repositories/raw-dataset-repository/raw-dataset-repository'

import { buildRawObjectKey } from './airflow-service.utils'

export interface IDagList {
  dags: IDagInfo[]
  total_entries: number
}

export interface IUploadedFile {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

export interface IAirflowService {
  listDags(): Promise<IDagList>
  triggerProcessing(params: { dagId: string; file: IUploadedFile }): Promise<IDagTriggeredInfo>
  getDagRun(params: { dagId: string; dagRunId: string }): Promise<IDagStatus>
}

export interface IAirflowServiceDependencies {
  airflowClient: Pick<AirflowClient, 'request'>
  rawDatasetRepository: Pick<IRawDatasetRepository, 'put'>
  rawPrefix: string
  allowedDagId: string
  now?: () => Date
}

const dagPath = (dagId: string) => `/api/v2/dags/${encodeURIComponent(dagId)}`

export class AirflowService implements IAirflowService {
  private readonly now: () => Date

  constructor(private readonly dependencies: IAirflowServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date())
  }

  public async listDags() {
    return this.dependencies.airflowClient.request<IDagList>({ method: 'GET', url: '/api/v2/dags' })
  }

  public async triggerProcessing({ dagId, file }: { dagId: string; file: IUploadedFile }) {
    const { airflowClient, rawDatasetRepository, rawPrefix, allowedDagId } = this.dependencies

    if (dagId !== allowedDagId) {
      throw new ValidationError(`Dag ${dagId} is not allowed`, { code: 'DAG_NOT_ALLOWED' })
    }

    const now = this.now()
    const objectKey = buildRawObjectKey(rawPrefix, file.originalname, now)

    await rawDatasetRepository.put({ key: objectKey, body: file.buffer, contentType: file.mimetype })

    return airflowClient.request<IDagTriggeredInfo>({
      method: 'POST',
      url: `${dagPath(dagId)}/dagRuns`,
      data: {
        logical_date: now.toISOString(),
        conf: { object_key: objectKey },
      },
    })
  }

  public async getDagRun({ dagId, dagRunId }: { dagId: string; dagRunId: string }) {
    return this.dependencies.airflowClient.request<IDagStatus>({
      method: 'GET',
      url: `${dagPath(dagId)}/dagRuns/${encodeURIComponent(dagRunId)}`,
    })
  }
}
