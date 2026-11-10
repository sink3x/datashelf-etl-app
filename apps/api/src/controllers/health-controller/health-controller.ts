import type { HealthService } from '@services/health-service/health-service'
import type { RequestHandler } from 'express'

export class HealthController {
  constructor(private readonly healthService: Pick<HealthService, 'readiness'>) {}

  public legacyHealthcheck: RequestHandler = (_request, response) => {
    response.status(200).json({ status: 'alive' })
  }

  public liveness: RequestHandler = (_request, response) => {
    response.status(200).json({ status: 'ok' })
  }

  public readiness: RequestHandler = async (_request, response) => {
    const report = await this.healthService.readiness()

    response.status(report.status === 'ready' ? 200 : 503).json(report)
  }
}
