import { z } from 'zod'

// Airflow ids allow word characters, dots and dashes; the leading character excludes "." and ".." segments.
const DAG_ID_PATTERN = /^[A-Za-z0-9][\w.-]{0,249}$/

const dagIdSchema = (missingMessage: string) =>
  z
    .string({ error: missingMessage })
    .trim()
    .min(1, missingMessage)
    .regex(DAG_ID_PATTERN, 'Dag ID is not valid')

export const processDataSchemas = {
  body: z.object({
    dagId: dagIdSchema('Dag ID not provided'),
  }),
}

export const dagRunStatusSchemas = {
  params: z.object({
    dagId: dagIdSchema('Dag ID not provided'),
    dagRunId: z
      .string()
      .min(1)
      .max(250)
      .refine((value) => value !== '.' && value !== '..', 'Dag run ID is not valid'),
  }),
}
