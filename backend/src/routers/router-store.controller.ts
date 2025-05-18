import type { Request } from 'express'

import type { THealthcheckControllerResponse } from './router-store.intefaces'

export const healthcheckController = (_request: Request, response: THealthcheckControllerResponse) => {
  response.status(200).json({ status: 'alive' })
}
