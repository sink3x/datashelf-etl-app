import type { IResponseMeta } from './response-meta'

export interface IApiResponse {
	message: string
	code?: string
	details?: unknown
	info?: Record<string, unknown>
	meta?: IResponseMeta
}
