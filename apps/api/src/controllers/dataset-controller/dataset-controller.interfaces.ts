import type { IBucketObject } from '@interfaces/bucket-object'
import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { IDocumentMongodb } from '@interfaces/document-mongodb'
import type { IObjectAny } from '@interfaces/object-any'
import type { TRequestParams, TRequestQuery } from '@interfaces/request'
import type { IResponseMeta } from '@interfaces/response-meta'
import type { Request, Response } from 'express'

export type TDatasetProcessedDocument = IDocumentMongodb<IDatasetProcessed>[]

export type IGetProcessedRequest = Request

export type IGetProcessedResponse = Response<{
  message: string
  datasetList?: TDatasetProcessedDocument[]
  info?: IObjectAny
  meta?: IResponseMeta
}>

export type IGetRawRequest = TRequestQuery<{
  page?: string
  limit?: string
}>

export type IGetRawResponse = Response<{
  message: string
  datasetList?: IBucketObject[]
  info?: IObjectAny
  meta?: IResponseMeta
}>

export type TGetChartsRequest = TRequestParams<{
  filename: string
}>

export type TGetChartsResponse = Response<{
  message: string
  charts?: Record<string, IDatasetProcessed['chart'][]>
  info?: IObjectAny
  meta?: IResponseMeta
}>
