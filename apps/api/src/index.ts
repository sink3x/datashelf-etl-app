import 'dotenv/config'

import { ConfigError, parseConfig } from '@config/config'
import { createLogger } from '@shared/logger'

import { App } from './app'

try {
  const config = parseConfig(process.env)

  new App(config, createLogger(config)).start()
} catch (error) {
  if (error instanceof ConfigError) {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  }

  throw error
}
