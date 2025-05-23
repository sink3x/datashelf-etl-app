import path from 'path'

import type { IAppConfig } from '@interfaces/config'
import { API_PREFIX } from '@routers/router-store/router-store.constants'
import { APP_MODE, BACKEND_VERSION } from '@shared/constants'
import { loadConfig } from '@utils/load-config'

const { server } = loadConfig(APP_MODE) || ({} as IAppConfig)
const { protocol, host, port } = server || {}
const appUrl = `${protocol}://${host}:${port}${API_PREFIX}`

export const ROUTER_PATH = path.resolve('./src/routers')
export const DOCUMNETATION_FILE_EXTENSION_LIST = ['yml', 'yaml']

export const swaggerSpecificationDocument = {
  openapi: '3.0.0',
  externalDocs: {
    description: `Backend application - ${appUrl}`,
    url: appUrl,
  },
  info: {
    title: 'Datashelf API',
    description: `Datashelf API provides a comprehensive interface for managing and processing data workflows.\n 
  It enables seamless integration with Airflow processes to automate and monitor data pipelines efficiently.\n 
  Designed for scalability and ease of use, this API supports data ingestion, transformation, and orchestration across diverse systems.`,
    version: BACKEND_VERSION,
  },
  tags: [
    {
      name: 'utils',
      description: 'Utility endpoints for service introspection with operational checks',
    },
    { name: 'airflow', description: 'Integration with Airflow processes' },
  ],
}

export const swaggerSpecificationOptions = {
  docExpansion: 'none',
  showRequestDuration: true,
  defaultModelsExpandDepth: -1,
  customSiteTitle: 'Datashelf API documentation',
}
