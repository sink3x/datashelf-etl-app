import type { HealthController } from '@controllers/health-controller/health-controller'
import { Router } from 'express'

export const createHealthRouter = (controller: HealthController) => {
  const router = Router()

  router.get('/healthz', controller.liveness)
  router.get('/readyz', controller.readiness)

  return router
}
