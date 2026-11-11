import type { Server } from 'http'
import { createServer } from 'http'

import type { IAppConfig } from '@config/config'
import type { TLogger } from '@shared/logger'

import { createContainer } from './container'

const STOP_TIMEOUT_MS = 15_000

const listen = (server: Server, port: number) =>
  new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => {
      server.off('error', reject)
      resolve()
    })
  })

const closeServer = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    if (!server.listening) {
      return resolve()
    }

    server.close((error) => (error ? reject(error) : resolve()))
    server.closeIdleConnections()
  })

export interface IRunningServer {
  stop(reason: string, exitCode?: number): Promise<void>
}

export const startServer = async (config: IAppConfig, logger: TLogger): Promise<IRunningServer> => {
  if (config.isProduction && config.corsOrigins.includes('*')) {
    logger.warn('CORS_ORIGINS allows any origin in production')
  }

  const container = createContainer(config, logger)
  const { mongodb, consumer, chartResultRepository, healthService, s3Client } = container
  const server = createServer(container.app)

  let stopping: Promise<void> | null = null

  // Order matters: stop consuming (in-flight messages still need Mongo), drain HTTP, then close clients.
  const stop = (reason: string, exitCode = 0) => {
    stopping ??= (async () => {
      logger.info({ reason }, 'graceful stop started')
      healthService.markShuttingDown()

      const forceExitTimer = setTimeout(() => {
        logger.error('graceful stop timed out, forcing exit')
        process.exit(1)
      }, STOP_TIMEOUT_MS)

      forceExitTimer.unref()

      const steps: [string, () => Promise<unknown>][] = [
        ['rabbitmq', () => consumer.stop()],
        ['http', () => closeServer(server)],
        ['mongodb', () => mongodb.close()],
        ['s3', async () => s3Client.destroy()],
      ]
      let code = exitCode

      for (const [name, step] of steps) {
        try {
          await step()
        } catch (error) {
          code = 1
          logger.error({ err: error, step: name }, 'stop step failed')
        }
      }

      clearTimeout(forceExitTimer)
      logger.info({ exitCode: code }, 'graceful stop finished')
      process.exit(code)
    })()

    return stopping
  }

  try {
    await mongodb.connect()
    await chartResultRepository.ensureIndexes()
    await consumer.start()
    await listen(server, config.port)
  } catch (error) {
    logger.fatal({ err: error }, 'bootstrap failed')
    await consumer.stop().catch(() => undefined)
    await mongodb.close().catch(() => undefined)
    throw error
  }

  logger.info({ port: config.port }, 'http server listening')

  process.once('SIGTERM', () => void stop('SIGTERM'))
  process.once('SIGINT', () => void stop('SIGINT'))

  return { stop }
}
