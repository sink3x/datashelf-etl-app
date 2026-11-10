import { API_PREFIX, BACKEND_VERSION } from '@shared/constants'

export const DOCUMENTATION_FILE_EXTENSION_LIST = ['yml', 'yaml']

export const swaggerSpecificationDocument = {
  openapi: '3.0.0',
  externalDocs: {
    description: `Backend application - ${API_PREFIX}`,
    url: API_PREFIX,
  },
  info: {
    title: 'Datashelf API',
    description: `Datashelf API provides a comprehensive interface for managing and processing data workflows.\n 
  It enables seamless integration with Airflow processes to automate and monitor data pipelines efficiently.\n 
  Designed for scalability and ease of use, this API supports data ingestion, transformation, and orchestration across diverse systems.`,
    version: BACKEND_VERSION,
  },
  tags: [
    { name: 'health', description: 'Liveness and readiness probes for orchestrators' },
    {
      name: 'utils',
      description: 'Utility endpoints for service introspection with operational checks',
    },
    { name: 'airflow', description: 'Integration with Airflow processes' },
    {
      name: 'dataset',
      description:
        'Provides access to operations related to raw and processed datasets, including retrieval, extraction, and augmentation',
    },
  ],
}

export const swaggerSpecificationOptions = {
  customfavIcon: '/favicon.ico',
  docExpansion: 'none',
  showRequestDuration: true,
  defaultModelsExpandDepth: -1,
  customSiteTitle: 'Datashelf API documentation',
}
