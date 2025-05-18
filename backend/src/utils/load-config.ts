import type { IAppConfig } from '@interfaces/config'
import type { TMaybe } from '@interfaces/maybe'

import appConfig from '../../configs/app.local.json'

export const loadConfig = (mode: string): TMaybe<IAppConfig> => {
  switch (mode) {
    case 'production':
      // todo: implement get config via cloud
      return null
    case 'development':
      return appConfig
  }

  return null
}
