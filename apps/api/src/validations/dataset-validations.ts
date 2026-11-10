import { z } from 'zod'

export const MAX_RAW_PAGE_SIZE = 100

export const rawListSchemas = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_RAW_PAGE_SIZE).default(10),
  }),
}

export const chartsSchemas = {
  params: z.object({
    filename: z.string().min(1).max(512),
  }),
}
