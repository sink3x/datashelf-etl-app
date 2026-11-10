import { delay, http, HttpResponse } from 'msw'

import {
	AIRFLOW_BASE,
	AIRFLOW_ROUTES,
	UPLOAD_DAG_ID_FIELD,
	UPLOAD_FILE_FIELD,
} from '@services/airflow-service/airflow-service.constants'
import { DATASET_BASE, DATASET_ROUTES } from '@services/dataset-service/dataset-service.constants'

import { createRun, getChartsByFilename, getRun, listProcessedDatasets, listRawFiles } from './db'
import { MOCK_DAGS } from './fixtures/airflow'

const ALLOWED_FILE_TYPES = ['application/json', 'text/csv']
const ALLOWED_EXTENSIONS = ['csv', 'json']
const MAX_UPLOAD_SIZE_MB = 10

const anyOrigin = (path: string) => `*${path}`

const badRequest = (message: string) => HttpResponse.json({ message, code: 'BAD_REQUEST' }, { status: 400 })

export const handlers = [
	http.get(anyOrigin('/api/healthcheck'), () => HttpResponse.json({ message: 'Ok' })),

	http.get(anyOrigin(AIRFLOW_ROUTES.dags), async () => {
		await delay()

		return HttpResponse.json({
			dags: MOCK_DAGS,
			total_entries: MOCK_DAGS.length,
			message: 'Successful get dags',
			meta: { totalCount: MOCK_DAGS.length },
		})
	}),

	http.get(anyOrigin(AIRFLOW_ROUTES.allowedFileTypes), () =>
		HttpResponse.json({
			message: 'Ok',
			allowedFileTypeList: ALLOWED_FILE_TYPES,
			meta: { totalCount: ALLOWED_FILE_TYPES.length },
		}),
	),

	http.post(anyOrigin(AIRFLOW_ROUTES.processData), async ({ request }) => {
		await delay()

		const formData = await request.formData()
		const file = formData.get(UPLOAD_FILE_FIELD)
		const dagId = formData.get(UPLOAD_DAG_ID_FIELD)

		if (!(file instanceof File)) {
			return badRequest('File not uploaded or not correct')
		}

		if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
			return badRequest(`File size limit exceeded, allowed only ${MAX_UPLOAD_SIZE_MB}mb`)
		}

		if (typeof dagId !== 'string' || !dagId) {
			return badRequest('Dag ID not provided')
		}

		const extension = file.name.split('.').at(-1)?.toLowerCase() ?? ''

		if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
			return badRequest(`File type ${file.type || extension} is not allowed`)
		}

		if (!MOCK_DAGS.some((dag) => dag.dag_id === dagId)) {
			return HttpResponse.json({ message: `The Dag with ID: \`${dagId}\` was not found` }, { status: 500 })
		}

		return HttpResponse.json({
			message: `Dag ${dagId} triggered`,
			triggeredDagInfo: createRun(dagId, file.name, file.size),
		})
	}),

	http.get(anyOrigin(`${AIRFLOW_BASE}/dag/status/:dagId/:dagRunId`), ({ params }) => {
		const dagId = decodeURIComponent(String(params.dagId))
		const dagRunId = decodeURIComponent(String(params.dagRunId))
		const dagStatus = getRun(dagId, dagRunId)

		if (!dagStatus) {
			return HttpResponse.json(
				{ message: `The DagRun with dag_id: \`${dagId}\` and run_id: \`${dagRunId}\` was not found` },
				{ status: 500 },
			)
		}

		return HttpResponse.json({ message: 'Ok', dagStatus })
	}),

	http.get(anyOrigin(DATASET_ROUTES.raw), async ({ request }) => {
		await delay()

		const url = new URL(request.url)
		const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
		const limit = Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? '10', 10) || 10)
		const files = listRawFiles().toReversed()
		const offset = (page - 1) * limit

		return HttpResponse.json({
			message: 'Ok',
			datasetList: files.slice(offset, offset + limit),
			meta: {
				totalCount: files.length,
				totalPages: Math.ceil(files.length / limit),
				currentPage: page,
				pageSize: limit,
			},
		})
	}),

	http.get(anyOrigin(DATASET_ROUTES.processed), async () => {
		await delay()

		const datasetList = listProcessedDatasets()

		return HttpResponse.json({ message: 'Ok', datasetList, meta: { totalCount: datasetList.length } })
	}),

	http.get(anyOrigin(`${DATASET_BASE}/charts/:filename`), async ({ params }) => {
		await delay()

		const charts = getChartsByFilename(decodeURIComponent(String(params.filename)))

		return HttpResponse.json({ message: 'Ok', charts, meta: { totalCount: Object.keys(charts).length } })
	}),
]
