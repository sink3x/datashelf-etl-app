import type { TMaybe } from './maybe'

export interface IDagScheduleInterval {
  __type: string
  value: string
}

export interface IDagInfo {
  dag_id: string
  default_view: string
  description: TMaybe<string>
  file_token: string
  fileloc: string
  has_import_errors: boolean
  has_task_concurrency_limits: boolean
  is_active: boolean
  is_paused: boolean
  is_subdag: boolean
  last_expired: TMaybe<string>
  last_parsed_time: string
  last_pickled: TMaybe<string>
  max_active_runs: number
  max_active_tasks: number
  next_dagrun: string
  next_dagrun_create_after: string
  next_dagrun_data_interval_end: string
  next_dagrun_data_interval_start: string
  owners: string[]
  pickle_id: TMaybe<string>
  root_dag_id: TMaybe<string>
  schedule_interval: IDagScheduleInterval
  scheduler_lock: TMaybe<unknown>
  tags: unknown[]
  timetable_description: string
}

export interface IDagStatus {
  dag_run_id: string
  dag_id: string
  logical_date: string
  queued_at: string
  start_date: string
  end_date: string
  data_interval_start: string
  data_interval_end: string
  run_after: string
  last_scheduling_decision: string
  run_type: string
  state: string
  triggered_by: string
  conf: {
    object_key: string
    note: TMaybe<string>
    dag_versions: [
      {
        id: string
        version_number: number
        dag_id: string
        bundle_name: string
        bundle_version: TMaybe<string>
        created_at: string
        bundle_url: TMaybe<string>
      },
    ]
  }
}
