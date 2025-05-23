import type { Express } from 'express'

import type { IAppConfig, TAppServices } from './config'

export interface IDIContainer {
  app: Express
  config: IAppConfig
  services: TAppServices
}
