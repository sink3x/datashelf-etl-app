import type { IBucketObject } from '@interfaces/bucket-object'
import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import { IDocumentMongodb } from '@interfaces/document-mongodb'
import type { IObjectAny } from '@interfaces/object-any'
import { IResponseMeta } from '@interfaces/response-meta'
import type { Request, Response } from 'express'

export type TDatasetProcessedDocument = IDocumentMongodb<IDatasetProcessed>[]

export type IGetProcessedRequest = Request

export type IGetProcessedResponse = Response<{
  message: string
  datasetList?: TDatasetProcessedDocument[]
  info?: IObjectAny
  meta?: IResponseMeta
}>

export type IGetRawRequest = Request

export type IGetRawResponse = Response<{
  message: string
  datasetList?: IBucketObject[]
  info?: IObjectAny
  meta?: IResponseMeta
}>
