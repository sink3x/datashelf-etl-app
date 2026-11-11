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
  components: Record<string, IObjectAny>
}

const loadYamlDocumentation = (directory: string): IYamlDocumentation => {
  const fileList = readdirSync(directory, { recursive: true }) as string[]
  const documentation: IYamlDocumentation = { paths: {}, components: {} }

  for (const file of fileList) {
    if (!DOCUMENTATION_FILE_EXTENSION_LIST.includes(file.split('.').at(-1) ?? '')) {
      continue
    }

    const yamlDocument: IObjectAny = YAML.load(path.join(directory, file)) ?? {}

    Object.assign(documentation.paths, yamlDocument.paths)
    for (const [section, entries] of Object.entries<IObjectAny>(yamlDocument.components ?? {})) {
      documentation.components[section] = { ...documentation.components[section], ...entries }
    }
  }

  return documentation
}

export const buildSwaggerSpecification = (logger?: TLogger, directory = OPENAPI_DIR): OpenAPIV3.Document => {
  let documentation: IYamlDocumentation = { paths: {}, components: {} }

  try {
    documentation = loadYamlDocumentation(directory)
  } catch (error) {
    logger?.warn({ err: error, directory }, 'openapi documentation not loaded')
  }

  return {
    ...swaggerSpecificationDocument,
    paths: documentation.paths,
    components: documentation.components,
  }
}
