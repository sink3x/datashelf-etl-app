import type { Request } from 'express'

export interface TRequestBody<T> extends Request {
  body: T
}

export interface TRequestParams<T> extends Omit<Request, 'params'> {
  params: T
}

export interface TRequestQuery<T> extends Omit<Request, 'query'> {
  query: T
}

export interface TRequestHeaders<T> extends Omit<Request, 'headers'> {
  headers: T
}
