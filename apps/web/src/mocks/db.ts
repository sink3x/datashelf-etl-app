import type { TChartsByName } from '@interfaces/chart'
import type { IDagRun, TDagRunState } from '@interfaces/dag'
import type { IDatasetProcessed } from '@interfaces/dataset-processed'
import type { IRawFile } from '@interfaces/file-raw'

import { MOCK_RAW_FILES_SEED } from './fixtures/airflow'
import { buildRetailCharts } from './fixtures/charts'

export const RAW_PREFIX = 'raw-data'

export interface IRunTimings {
	queuedMs: number
	runningMs: number
}

interface IMockRun {
	dagRun: IDagRun
	createdAt: number
	file: IRawFile
}

interface IMockDb {
	rawFiles: IRawFile[]
	charts: Map<string, TChartsByName>
	processedAt: Map<string, string>
	runs: Map<string, IMockRun>
	timings: IRunTimings
}

const DEFAULT_TIMINGS: IRunTimings = { queuedMs: 2500, runningMs: 6000 }

const createDb = (): IMockDb => {
	const rawFiles = MOCK_RAW_FILES_SEED.map((file) => ({ ...file, key: `${RAW_PREFIX}/${file.fileName}` }))

	return {
		rawFiles,
		charts: new Map(rawFiles.map((file) => [file.fileName, buildRetailCharts(file.fileName)])),
		processedAt: new Map(rawFiles.map((file) => [file.fileName, file.lastModified])),
		runs: new Map(),
		timings: { ...DEFAULT_TIMINGS },
	}
}

const PERSISTENCE_KEY = 'datashelf.mock-db'

let db = createDb()
let isPersistent = false

const persist = () => {
	if (!isPersistent) {
		return
	}

	try {
		const uploadedFiles = db.rawFiles.filter(
			(file) => !MOCK_RAW_FILES_SEED.some(({ fileName }) => fileName === file.fileName),
		)

		window.localStorage.setItem(
			PERSISTENCE_KEY,
			JSON.stringify({ uploadedFiles, runs: [...db.runs.values()] }),
		)
	} catch {
		// The demo keeps working in memory when storage is unavailable.
	}
}

export const enableMockPersistence = () => {
	isPersistent = true

	try {
		const stored = JSON.parse(window.localStorage.getItem(PERSISTENCE_KEY) ?? 'null') as {
			uploadedFiles?: IRawFile[]
			runs?: IMockRun[]
		} | null

		stored?.uploadedFiles?.forEach((file) => db.rawFiles.push(file))
		stored?.runs?.forEach((run) => db.runs.set(run.dagRun.dag_run_id, run))
	} catch {
		// Ignore corrupted demo state and start from the seed data.
	}
}

export const resetMockDb = (timings: Partial<IRunTimings> = {}) => {
	db = createDb()
	db.timings = { ...DEFAULT_TIMINGS, ...timings }
}

const getRunDurationMs = () => db.timings.queuedMs + db.timings.runningMs

const finalizeCompletedRuns = () => {
	db.runs.forEach((run) => {
		if (Date.now() - run.createdAt < getRunDurationMs() || db.charts.has(run.file.fileName)) {
			return
		}

		db.charts.set(run.file.fileName, buildRetailCharts(run.file.fileName))
		db.processedAt.set(run.file.fileName, new Date(run.createdAt + getRunDurationMs()).toISOString())
	})
}

export const listRawFiles = () => [...db.rawFiles]

export const getChartsByFilename = (filename: string): TChartsByName => {
	finalizeCompletedRuns()

	return db.charts.get(filename) ?? {}
}

export const listProcessedDatasets = (): IDatasetProcessed[] => {
	finalizeCompletedRuns()

	return [...db.charts.entries()].map(([filename, charts], index) => ({
		id: `mock-${index + 1}`,
		filename,
		processed_at: db.processedAt.get(filename) ?? new Date().toISOString(),
		processing_time_sec: 0.42,
		meta: { total_rows: 1000 },
		chart: Object.values(charts).flat(),
	}))
}

const toObjectKey = (originalName: string, now: Date) => {
	const extension = originalName.includes('.') ? originalName.split('.').at(-1) : ''
	const baseName = extension ? originalName.slice(0, -(extension.length + 1)) : originalName
	const suffix = Math.floor(now.getTime() / 1000)

	return `${RAW_PREFIX}/${baseName}-${suffix}${extension ? `.${extension}` : ''}`
}

export const createRun = (dagId: string, originalName: string, size: number): IDagRun => {
	const now = new Date()
	const objectKey = toObjectKey(originalName, now)
	const dagRunId = `manual__${now.toISOString().replace('Z', '+00:00')}`
	const dagRun: IDagRun = {
		dag_run_id: dagRunId,
		dag_id: dagId,
		logical_date: now.toISOString(),
		queued_at: now.toISOString(),
		start_date: null,
		end_date: null,
		run_type: 'manual',
		state: 'queued',
		triggered_by: 'rest_api',
		conf: { object_key: objectKey },
		note: null,
	}
	const file: IRawFile = {
		fileName: objectKey.split('/').at(-1)!,
		key: objectKey,
		lastModified: now.toISOString(),
		size,
	}

	db.rawFiles.push(file)
	db.runs.set(dagRunId, { dagRun, createdAt: now.getTime(), file })
	persist()

	return dagRun
}

const getStateAt = (elapsedMs: number): TDagRunState => {
	if (elapsedMs < db.timings.queuedMs) {
		return 'queued'
	}

	if (elapsedMs < db.timings.queuedMs + db.timings.runningMs) {
		return 'running'
	}

	return 'success'
}

export const getRun = (dagId: string, dagRunId: string): IDagRun | null => {
	const run = db.runs.get(dagRunId)

	if (!run || run.dagRun.dag_id !== dagId) {
		return null
	}

	const elapsedMs = Date.now() - run.createdAt
	const state = getStateAt(elapsedMs)
	const startedAt = new Date(run.createdAt + db.timings.queuedMs).toISOString()
	const endedAt = new Date(run.createdAt + db.timings.queuedMs + db.timings.runningMs).toISOString()

	finalizeCompletedRuns()

	return {
		...run.dagRun,
		state,
		start_date: state === 'queued' ? null : startedAt,
		end_date: state === 'success' ? endedAt : null,
	}
}
