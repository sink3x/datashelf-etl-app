import 'dotenv/config'

import { ConfigError, parseConfig } from '@config/config'

import { App } from './app'

try {
  new App(parseConfig(process.env)).start()
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message)
    process.exit(1)
  }

  throw error
}
