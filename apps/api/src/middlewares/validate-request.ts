import { ValidationError } from '@errors/app-error'
import type { RequestHandler, Response } from 'express'
import type { z } from 'zod'

type TRequestPart = 'params' | 'query' | 'body'

export type TRequestSchemas = Partial<Record<TRequestPart, z.ZodType>>

export type TValidatedRequest<S extends TRequestSchemas> = {
  [K in keyof S]: S[K] extends z.ZodType ? z.output<S[K]> : never
}

export interface IValidationIssue {
  location: TRequestPart
  path: string
  message: string
}

const REQUEST_PARTS: TRequestPart[] = ['params', 'query', 'body']

// Express 5 exposes req.query as a getter, so parsed values are stored on res.locals instead.
export const validateRequest =
  <S extends TRequestSchemas>(schemas: S): RequestHandler =>
  (request, response, next) => {
    const validated: Partial<Record<TRequestPart, unknown>> = {}
    const issues: IValidationIssue[] = []

    for (const part of REQUEST_PARTS) {
      const schema = schemas[part]

      if (!schema) {
        continue
      }

      const result = schema.safeParse(request[part] ?? {})

      if (result.success) {
        validated[part] = result.data
        continue
      }

      for (const issue of result.error.issues) {
        issues.push({ location: part, path: issue.path.join('.'), message: issue.message })
      }
    }

    if (issues.length) {
      return next(new ValidationError(issues.map(({ message }) => message).join('; '), { details: issues }))
    }

    response.locals.validated = validated
    next()
  }

export const getValidated = <S extends TRequestSchemas>(response: Response, _schemas: S) =>
  response.locals.validated as TValidatedRequest<S>
