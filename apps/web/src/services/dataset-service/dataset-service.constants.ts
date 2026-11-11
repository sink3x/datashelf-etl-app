export const DATASET_BASE = '/api/dataset'

export const DATASET_ROUTES = {
	raw: `${DATASET_BASE}/raw`,
	processed: `${DATASET_BASE}/processed`,
	charts: (filename: string) => `${DATASET_BASE}/charts/${encodeURIComponent(filename)}`,
} as const
