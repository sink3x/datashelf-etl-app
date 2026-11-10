import type { IAppConfig } from '@config/config'
import type { TLogger } from '@shared/logger'
import type { Express } from 'express'

import type { TAppServices } from './config'

export interface IDIContainer {
  app: Express
  config: IAppConfig
  logger: TLogger
  services: TAppServices
}
