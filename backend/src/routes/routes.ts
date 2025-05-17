import { Router } from 'express'

import { ErrorRouter } from './error-router/error-router'

import type { Express } from 'express'

export class RouterMain {
  private readonly router = Router()

  private readonly ErrorRouter = new ErrorRouter().router

  constructor(app: Express) {
    app.use(this.router)
    app.use(this.ErrorRouter)

    this.router.get('/api', (_request, response) => {
      response.status(200).json({
        message: '👋',
      })
    })
  }
}
