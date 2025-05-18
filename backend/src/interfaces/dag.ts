export interface IDagScheduleInterval {
  __type: string
  value: string
}

export interface IDagInfo {
  dag_id: string
  default_view: string
  description: string | null
  file_token: string
  fileloc: string
  has_import_errors: boolean
  has_task_concurrency_limits: boolean
  is_active: boolean
  is_paused: boolean
  is_subdag: boolean
  last_expired: string | null
  last_parsed_time: string
  last_pickled: string | null
  max_active_runs: number
  max_active_tasks: number
  next_dagrun: string
  next_dagrun_create_after: string
  next_dagrun_data_interval_end: string
  next_dagrun_data_interval_start: string
  owners: string[]
  pickle_id: string | null
  root_dag_id: string | null
  schedule_interval: IDagScheduleInterval
  scheduler_lock: unknown | null
  tags: unknown[]
  timetable_description: string
}
