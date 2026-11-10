import { readdirSync } from 'fs'
import path from 'path'

import type { IObjectAny } from '@interfaces/object-any'
import { OPENAPI_DIR } from '@shared/paths'
import type { OpenAPIV3 } from 'openapi-types'
import YAML from 'yamljs'


import { DOCUMENTATION_FILE_EXTENSION_LIST, swaggerSpecificationDocument } from './swagger.constants'

const loadYamlDocumentation = (): Record<string, IObjectAny> => {
  try {
    const fileList = readdirSync(OPENAPI_DIR, { recursive: true }) as string[]
    const yamlFileList = fileList.filter((filename) => {
      const fileExtension = filename.split('.').at(-1) || ''

      return DOCUMENTATION_FILE_EXTENSION_LIST.includes(fileExtension)
    })

    let documentationPaths: Record<string, IObjectAny> = {}

    for (const yamlFile of yamlFileList) {
      const yamlDocumentationObject = YAML.load(path.join(OPENAPI_DIR, yamlFile)) || {}

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
