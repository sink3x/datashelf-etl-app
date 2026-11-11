#!/usr/bin/env bash
# End-to-end smoke test: upload a dataset through the API, wait for the Airflow run,
# then check that the computed charts reached MongoDB through RabbitMQ.
# Usage: scripts/smoke.sh <api-base-url> <dataset.csv> [dag-id]
set -euo pipefail

API_URL="${1:?api base url required}"
DATASET="${2:?dataset path required}"
DAG_ID="${3:-customer_data_etl}"
TIMEOUT_SEC="${SMOKE_TIMEOUT_SEC:-600}"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

log() { printf '[smoke] %s\n' "$*"; }
fail() { printf '[smoke] FAIL: %s\n' "$*" >&2; exit 1; }

log "waiting for ${API_URL}/readyz"
deadline=$((SECONDS + 180))
until curl -fsS "${API_URL}/readyz" >/dev/null 2>&1; do
  (( SECONDS < deadline )) || fail "API is not ready"
  sleep 5
done

log "uploading ${DATASET}"
response="$(curl -fsS -X POST "${API_URL}/api/airflow/process-data" \
  -F "dagId=${DAG_ID}" \
  -F "file=@${DATASET};type=text/csv")" || fail "upload rejected"

run_id="$(jq -r '.triggeredDagInfo.dag_run_id' <<<"${response}")"
object_key="$(jq -r '.triggeredDagInfo.conf.object_key' <<<"${response}")"
filename="${object_key##*/}"
[[ -n "${run_id}" && "${run_id}" != "null" ]] || fail "no dag_run_id in response: ${response}"
log "dag run ${run_id} for ${filename}"

encoded_run_id="$(jq -rn --arg v "${run_id}" '$v|@uri')"
deadline=$((SECONDS + TIMEOUT_SEC))
while :; do
  state="$(curl -fsS "${API_URL}/api/airflow/dag/status/${DAG_ID}/${encoded_run_id}" | jq -r '.dagStatus.state')"
  log "state: ${state}"
  case "${state}" in
    success) break ;;
    failed) fail "dag run failed" ;;
  esac
  (( SECONDS < deadline )) || fail "timed out waiting for the dag run"
  sleep 10
done

deadline=$((SECONDS + 60))
while :; do
  charts="$(curl -fsS "${API_URL}/api/dataset/charts/${filename}" | jq '.meta.totalCount')"
  (( charts > 0 )) && break
  (( SECONDS < deadline )) || fail "no charts stored for ${filename}"
  sleep 3
done

log "OK — ${charts} chart groups available for ${filename}"
