import { ValidationError } from '@errors/app-error'
import { getValidated } from '@middlewares/validate-request'
import type { IAirflowService } from '@services/airflow-service/airflow-service'
import { dagRunStatusSchemas, processDataSchemas } from '@validations/airflow-validations'
import type { RequestHandler } from 'express'

import { ALLOWED_FILE_TYPE_LIST } from './airflow-controller.constants'

export class AirflowController {
  constructor(private readonly airflowService: IAirflowService) {}

  public getDagList: RequestHandler = async (_request, response) => {
    const { dags, total_entries } = await this.airflowService.listDags()

    response.status(200).json({
      dags,
      total_entries,
      message: 'Successful get dags',
      meta: { totalCount: dags.length },
    })
  }

  public processData: RequestHandler = async (request, response) => {
    const { body } = getValidated(response, processDataSchemas)

    if (!request.file) {
      throw new ValidationError('File not uploaded or not correct', { code: 'FILE_REQUIRED' })
    }

    const triggeredDagInfo = await this.airflowService.triggerProcessing({
      dagId: body.dagId,
      file: request.file,
    })

    response.status(200).json({
      message: `Dag ${body.dagId} triggered`,
      triggeredDagInfo,
    })
  }

  public getAllowedFileTypeList: RequestHandler = (_request, response) => {
    response.status(200).json({
      message: 'Ok',
      allowedFileTypeList: ALLOWED_FILE_TYPE_LIST,
      meta: { totalCount: ALLOWED_FILE_TYPE_LIST.length },
    })
  }

  public getDagStatusByDagRunId: RequestHandler = async (_request, response) => {
    const { params } = getValidated(response, dagRunStatusSchemas)
    const dagStatus = await this.airflowService.getDagRun(params)

    response.status(200).json({
      message: 'Ok',
      dagStatus,
    })
  }
}
