import type { TMaybe } from './maybe'

export type TDagRunState = 'queued' | 'running' | 'success' | 'failed'

export interface IDagTag {
	name: string
}

export interface IDag {
	dag_id: string
	dag_display_name?: string
	description?: TMaybe<string>
	is_paused: boolean
	is_stale?: boolean
	has_import_errors?: boolean
	owners?: string[]
	tags?: IDagTag[]
	timetable_description?: TMaybe<string>
	timetable_summary?: TMaybe<string>
	last_parsed_time?: TMaybe<string>
	next_dagrun_logical_date?: TMaybe<string>
	max_active_runs?: number
}

export interface IDagRunConf {
	object_key?: string
	[key: string]: unknown
}

export interface IDagRun {
	dag_run_id: string
	dag_id: string
	logical_date: TMaybe<string>
	queued_at: TMaybe<string>
	start_date: TMaybe<string>
	end_date: TMaybe<string>
	run_type: string
	state: TDagRunState
	triggered_by?: string
	conf: IDagRunConf
	note?: TMaybe<string>
}
