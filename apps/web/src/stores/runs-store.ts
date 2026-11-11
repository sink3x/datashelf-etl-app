import { makeAutoObservable, runInAction } from 'mobx'

import type { IDagRun, TDagRunState } from '@interfaces/dag'
import { getDagRunStatus } from '@services/airflow-service/airflow-service'
import { getAxiosError } from '@utils/get-axios-error/get-axios-error'

export const RUNS_STORAGE_KEY = 'datashelf.recent-runs'
export const MAX_TRACKED_RUNS = 20

const TERMINAL_STATES: ReadonlySet<TDagRunState> = new Set(['success', 'failed'])

export interface ITrackedRun {
	dagId: string
	dagRunId: string
	filename: string
	state: TDagRunState
	queuedAt: string
	updatedAt: string
	errorMessage?: string
}

export const getFilenameFromObjectKey = (objectKey: string | undefined, fallback: string) =>
	objectKey?.split('/').at(-1) || fallback

export const isTerminalRunState = (state: TDagRunState) => TERMINAL_STATES.has(state)

const readStoredRuns = (): ITrackedRun[] => {
	try {
		const raw = window.localStorage.getItem(RUNS_STORAGE_KEY)
		const parsed: unknown = raw ? JSON.parse(raw) : []

		return Array.isArray(parsed) ? (parsed as ITrackedRun[]) : []
	} catch {
		return []
	}
}

export class RunsStore {
	runs: ITrackedRun[] = readStoredRuns()

	constructor() {
		makeAutoObservable(this)
	}

	get activeRuns() {
		return this.runs.filter((run) => !isTerminalRunState(run.state))
	}

	getRun = (dagRunId: string) => this.runs.find((run) => run.dagRunId === dagRunId)

	trackRun = (dagRun: IDagRun, fallbackFilename: string) => {
		const now = new Date().toISOString()
		const trackedRun: ITrackedRun = {
			dagId: dagRun.dag_id,
			dagRunId: dagRun.dag_run_id,
			filename: getFilenameFromObjectKey(dagRun.conf?.object_key, fallbackFilename),
			state: dagRun.state,
			queuedAt: dagRun.queued_at ?? now,
			updatedAt: now,
		}

		this.runs = [trackedRun, ...this.runs.filter((run) => run.dagRunId !== dagRun.dag_run_id)].slice(
			0,
			MAX_TRACKED_RUNS,
		)
		this.persist()

		return trackedRun
	}

	refreshRun = async (dagRunId: string) => {
		const run = this.getRun(dagRunId)

		if (!run) {
			return
		}

		try {
			const { dagStatus } = await getDagRunStatus(run.dagId, run.dagRunId)

			if (dagStatus) {
				this.updateRun(dagRunId, { state: dagStatus.state })
			}
		} catch (error) {
			this.updateRun(dagRunId, { errorMessage: getAxiosError(error) })
		}
	}

	refreshActiveRuns = async () => {
		await Promise.all(this.activeRuns.map((run) => this.refreshRun(run.dagRunId)))
	}

	clear = () => {
		this.runs = []
		this.persist()
	}

	private updateRun = (dagRunId: string, patch: Partial<Pick<ITrackedRun, 'state' | 'errorMessage'>>) => {
		runInAction(() => {
			this.runs = this.runs.map((run) => {
				if (run.dagRunId !== dagRunId) {
					return run
				}

				const { errorMessage: _previousError, ...rest } = run

				return {
					...rest,
					...patch,
					updatedAt: new Date().toISOString(),
				}
			})
		})
		this.persist()
	}

	private persist = () => {
		try {
			window.localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(this.runs))
		} catch {
			// Storage can be unavailable (private mode, quota); the list then lives in memory only.
		}
	}
}

export const runsStore = new RunsStore()
