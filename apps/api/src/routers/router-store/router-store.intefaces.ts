import type { Response } from 'express'

export type THealthcheckControllerResponse = Response<{
  status: string
}>
