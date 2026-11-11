import 'dotenv/config'

import { ConfigError, parseConfig } from '@config/config'
import { createLogger } from '@shared/logger'

import type { IRunningServer } from './server'
import { startServer } from './server'

const main = async () => {
  let config

  try {
    config = parseConfig(process.env)
  } catch (error) {
    if (error instanceof ConfigError) {
      process.stderr.write(`${error.message}\n`)
      process.exit(1)
    }

    throw error
  }

  const logger = createLogger(config)
  let runningServer: IRunningServer | null = null

  const onFatal = (message: string) => (error: unknown) => {
    logger.fatal({ err: error }, message)

    if (runningServer) {
      void runningServer.stop(message, 1)
    } else {
      process.exit(1)
    }
  }

  process.on('unhandledRejection', onFatal('unhandled promise rejection'))
  process.on('uncaughtException', onFatal('uncaught exception'))

  try {
    runningServer = await startServer(config, logger)
  } catch {
    process.exit(1)
  }
}

void main()
