import { Router } from 'express'

export class ErrorRouter {
  public readonly router = Router()

  constructor() {
    this.router.all('/', (_request, response) => {
      response.status(404).json({
        message: 'Requested endpoint not found',
      })
    })

    this.router.use((_request, response) => {
      response.status(500).json({
        message: 'Internal server error',
      })
    })
  }
}
