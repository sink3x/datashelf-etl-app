export const AIRFLOW_BASE = '/api/airflow'

export const AIRFLOW_ROUTES = {
	dags: `${AIRFLOW_BASE}/dags`,
	allowedFileTypes: `${AIRFLOW_BASE}/allowed-file-type-list`,
	processData: `${AIRFLOW_BASE}/process-data`,
	dagRunStatus: (dagId: string, dagRunId: string) =>
		`${AIRFLOW_BASE}/dag/status/${encodeURIComponent(dagId)}/${encodeURIComponent(dagRunId)}`,
} as const

export const UPLOAD_FILE_FIELD = 'file'
export const UPLOAD_DAG_ID_FIELD = 'dagId'
