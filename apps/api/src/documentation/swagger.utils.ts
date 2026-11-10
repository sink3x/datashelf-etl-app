import { readdirSync } from 'fs'
import path from 'path'

import type { IObjectAny } from '@interfaces/object-any'
import type { TLogger } from '@shared/logger'
import { OPENAPI_DIR } from '@shared/paths'
import type { OpenAPIV3 } from 'openapi-types'
import YAML from 'yamljs'

import { DOCUMENTATION_FILE_EXTENSION_LIST, swaggerSpecificationDocument } from './swagger.constants'

interface IYamlDocumentation {
  paths: Record<string, IObjectAny>
  schemas: Record<string, IObjectAny>
}

const loadYamlDocumentation = (directory: string): IYamlDocumentation => {
  const fileList = readdirSync(directory, { recursive: true }) as string[]
  const documentation: IYamlDocumentation = { paths: {}, schemas: {} }

  for (const file of fileList) {
    if (!DOCUMENTATION_FILE_EXTENSION_LIST.includes(file.split('.').at(-1) ?? '')) {
      continue
    }

    const yamlDocument: IObjectAny = YAML.load(path.join(directory, file)) ?? {}

    Object.assign(documentation.paths, yamlDocument.paths)
    Object.assign(documentation.schemas, yamlDocument.components?.schemas)
  }

  return documentation
}

export const buildSwaggerSpecification = (logger?: TLogger, directory = OPENAPI_DIR): OpenAPIV3.Document => {
  let documentation: IYamlDocumentation = { paths: {}, schemas: {} }

  try {
    documentation = loadYamlDocumentation(directory)
  } catch (error) {
    logger?.warn({ err: error, directory }, 'openapi documentation not loaded')
  }

  return {
    ...swaggerSpecificationDocument,
    paths: documentation.paths,
    components: { schemas: documentation.schemas },
  }
}
