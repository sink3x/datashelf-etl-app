import { describe, expect, it } from 'vitest'

import { HealthService } from '../../src/services/health-service/health-service'

describe('HealthService', () => {
  it('is ready only when every check passes', async () => {
    const service = new HealthService({ a: () => undefined, b: async () => undefined })

    await expect(service.readiness()).resolves.toEqual({ status: 'ready', checks: { a: 'up', b: 'up' } })
  })

  it('marks failing and hanging checks as down', async () => {
    const service = new HealthService(
      {
        failing: () => {
          throw new Error('down')
        },
        hanging: () => new Promise(() => undefined),
      },
      20,
    )

    await expect(service.readiness()).resolves.toEqual({
      status: 'not_ready',
      checks: { failing: 'down', hanging: 'down' },
    })
  })

  it('reports not ready while shutting down', async () => {
    const service = new HealthService({ a: () => undefined })

    service.markShuttingDown()

    await expect(service.readiness()).resolves.toMatchObject({ status: 'not_ready' })
  })
})
