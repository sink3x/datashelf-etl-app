import type { IAppConfig } from '@config/config'
import type { Express } from 'express'

import type { TAppServices } from './config'

export interface IDIContainer {
  app: Express
  config: IAppConfig
  services: TAppServices
}
