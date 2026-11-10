# Runbook

## Local stack

| Task             | Command                      |
| ---------------- | ---------------------------- |
| Start everything | `make up`                    |
| Status / logs    | `make ps`, `make logs S=api` |
| End-to-end check | `make smoke`                 |
| Stop / wipe data | `make down`, `make nuke`     |

| UI                     | URL                        | Credentials (local only)                    |
| ---------------------- | -------------------------- | ------------------------------------------- |
| Web console            | http://localhost:3000      | —                                           |
| API docs (Swagger)     | http://localhost:5000/docs | —                                           |
| Airflow                | http://localhost:8080      | `AIRFLOW_USERNAME` / `AIRFLOW_PASSWORD`     |
| RabbitMQ management    | http://localhost:15672     | `RABBITMQ_USER` / `RABBITMQ_PASSWORD`       |
| Object storage console | http://localhost:9001      | `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` |

## Health

- `GET /healthz` — process is alive.
- `GET /readyz` — MongoDB, RabbitMQ and object storage are reachable; returns 503 with the failing dependency
  otherwise.

## Common incidents

**Upload succeeds, dashboard stays empty**

1. Airflow UI → DAG `customer_data_etl` → the run for the upload. A failed `extract` usually means the file
   does not match the expected columns; the task log names the missing columns.
2. RabbitMQ UI → queue `datashelf.api.charts-computed.dlq`. Messages here failed validation in the API; the
   API log line with the same `message_id` explains why.
3. API logs: `make logs S=api` and look for `charts event` entries.

**Analytics task fails with `unroutable` / `nacked`** The API has not declared its queue yet (first start) or
RabbitMQ is down. Start the API, then clear the failed task in Airflow — publishing is idempotent.

**Replaying dead-lettered messages** Fix the cause, then in RabbitMQ UI use _Move messages_ (shovel plugin)
from the DLQ to exchange `datashelf.events` with routing key `dataset.charts.computed`, or rerun the affected
Airflow tasks.

## Cloud (Yandex Cloud)

| Task                     | Command                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| Plan / apply             | `make tf-plan IMAGE_TAG=<sha>` then `make tf-apply`                                                  |
| Full rollout             | `make cloud-up`                                                                                      |
| Smoke test               | `make cloud-smoke`                                                                                   |
| Tear down                | `make tf-destroy`                                                                                    |
| Read runtime secrets     | `yc lockbox payload get $(terraform -chdir=infra/terraform/envs/dev output -raw lockbox_secret_id)`  |
| Airflow UI               | `ssh -L 8080:localhost:8080 datashelf@<vm_public_ip>` (SSH and :8080 are open only to `admin_cidrs`) |
| Container logs on the VM | `ssh datashelf@<ip> docker logs <container>`                                                         |

Rollback: re-run `make tf-plan tf-apply IMAGE_TAG=<previous sha>` — the VM metadata switches back to the
previous images and the Container Optimized Image restarts the compose spec.
