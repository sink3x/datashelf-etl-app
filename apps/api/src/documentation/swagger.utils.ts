import { readdirSync } from 'fs'
import path from 'path'

import type { IObjectAny } from '@interfaces/object-any'
import type { OpenAPIV3 } from 'openapi-types'
import YAML from 'yamljs'

import {
  DOCUMNETATION_FILE_EXTENSION_LIST,
  ROUTER_PATH,
  swaggerSpecificationDocument,
} from './swagger.constants'

const loadYamlDocumentation = (): Record<string, IObjectAny> => {
  try {
    const fileList = readdirSync(ROUTER_PATH, { recursive: true }) as string[]
    const yamlFileList = fileList.filter((filename) => {
      const fileExtension = filename.split('.').at(-1) || ''

      return DOCUMNETATION_FILE_EXTENSION_LIST.includes(fileExtension)
    })

    let documentationPaths: Record<string, IObjectAny> = {}

    for (const yamlFile of yamlFileList) {
      const yamlDocumentationObject = YAML.load(path.join(ROUTER_PATH, yamlFile)) || {}

      if (yamlDocumentationObject.paths) {
        documentationPaths = {
          ...documentationPaths,
          ...yamlDocumentationObject.paths,
        }
      }
    }

    return documentationPaths
  } catch (error) {
    console.log(`[status] documentation files not found`, error)

    return {}
  }
}

export const buildSwaggerSpecification = (): OpenAPIV3.Document => {
  const paths = loadYamlDocumentation()

  return {
    ...swaggerSpecificationDocument,
    paths,
  }
}
