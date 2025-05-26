import type { IBucketObject } from '@interfaces/bucket-object'
import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { IObjectAny } from '@interfaces/object-any'
import type { Request, Response } from 'express'
import type { Document } from 'mongoose'

export type TDatasetProcessedDocument = Document<IDatasetProcessed>[]

export type IGetProcessedRequest = Request

export type IGetProcessedResponse = Response<{
  message: string
  datasetList?: TDatasetProcessedDocument[]
  info?: IObjectAny
}>

export type IGetRawRequest = Request

export type IGetRawResponse = Response<{
  message: string
  datasetList?: IBucketObject[]
  info?: IObjectAny
}>
