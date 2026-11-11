import type { appConfigSchema } from './config.schema'
import type { z } from 'zod'

export type IAppConfig = z.infer<typeof appConfigSchema>
