import { getValidated } from '@middlewares/validate-request'
import type { IDatasetService } from '@services/dataset-service/dataset-service'
import { chartsSchemas, rawListSchemas } from '@validations/dataset-validations'
import type { RequestHandler } from 'express'

export class DatasetController {
  constructor(private readonly datasetService: IDatasetService) {}

  public getProcessed: RequestHandler = async (_request, response) => {
    const datasetList = await this.datasetService.listProcessed()

    response.status(200).json({
      message: 'Ok',
      datasetList,
      meta: { totalCount: datasetList.length },
    })
  }

  public getRaw: RequestHandler = async (_request, response) => {
    const { query } = getValidated(response, rawListSchemas)
    const { items, totalCount, totalPages, truncated } = await this.datasetService.listRaw(query)

    response.status(200).json({
      message: 'Ok',
      datasetList: items,
      meta: {
        totalCount,
        totalPages,
        currentPage: query.page,
        pageSize: query.limit,
        truncated,
      },
    })
  }

  public getCharts: RequestHandler = async (_request, response) => {
    const { params } = getValidated(response, chartsSchemas)
    const charts = await this.datasetService.getCharts(params.filename)

    response.status(200).json({
      message: 'Ok',
      charts,
      meta: { totalCount: Object.keys(charts).length },
    })
  }
}
