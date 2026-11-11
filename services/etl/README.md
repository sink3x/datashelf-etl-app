# datashelf-etl

Airflow 3 pipeline that turns an uploaded retail dataset (CSV or JSON) into dashboard charts. The API
uploads the file to S3 under `raw-data/` and triggers the `customer_data_etl` DAG with
`conf={"object_key": "raw-data/<file>"}`. Each analytics task publishes one `dataset.charts.computed` event
(contract: [`packages/contracts`](../../packages/contracts)) to RabbitMQ; the API consumes it and stores the
charts in MongoDB.

## DAG

```mermaid
graph LR
  extract[extract<br/>validate key, parse, normalize,<br/>write staging parquet] --> customer_category[analyze_customer_category]
  extract --> payment_methods[analyze_payment_methods]
  extract --> store_type[analyze_store_type]
  extract --> city_wordcloud[analyze_city_wordcloud]
  extract --> customer_category_wordcloud[analyze_customer_category_wordcloud]
  extract --> seasons[analyze_seasons]
  extract --> monthly_sales[analyze_monthly_sales]
  extract --> city_sales_summary[analyze_city_sales_summary]
  extract --> retail_metrics[analyze_retail_metrics]
  customer_category & payment_methods & store_type & city_wordcloud & customer_category_wordcloud --> summarize[summarize<br/>trigger_rule=all_done]
  seasons & monthly_sales & city_sales_summary & retail_metrics --> summarize
```

- **extract** reads `s3://$S3_BUCKET/<object_key>`, rejects keys outside `$S3_RAW_PREFIX/`, parses CSV/JSON,
  validates the retail schema (required columns, date and numeric types, non-empty) and writes
  `s3://$S3_BUCKET/$S3_STAGING_PREFIX/<run_id>/dataset.parquet`. Only the two S3 keys go to XCom.
- **analyze\_\<job\>** reads the parquet, runs a pure `DataFrame -> charts + meta` function from
  `datashelf_etl.analytics`, then publishes one event (`job` = `<job>`).
- **summarize** runs after all analytics tasks whatever their state and fails the run if any job did not
  publish, so partial results are visible in Airflow instead of silently missing on the dashboard.

### Failure handling

- Analytics tasks are independent: one failing job does not block the others' events.
- Transient errors (S3, broker unreachable, unroutable or nacked message) raise and are retried 3 times with
  exponential backoff (20 s base, capped at 5 min).
- Bad input (invalid `object_key`, unsupported format, schema violations, empty data) fails immediately
  with `AirflowFailException`; retrying would not help.
- Publishing is at-least-once: a task may publish again on retry or when cleared. Each attempt gets a new
  `event_id`, but the consumer upserts by the idempotency key `(run_id, job)`, so duplicates are harmless.
- The publisher uses publisher confirms, `mandatory=True` and persistent delivery; it declares only the
  `datashelf.events` topic exchange. Queues and the DLQ are owned by the API.
- Staged parquet files are not deleted by the DAG; expire `$S3_STAGING_PREFIX/` with a bucket lifecycle rule.

## Layout

```text
dags/customer_data_etl.py        thin TaskFlow DAG (imports the package inside tasks)
src/datashelf_etl/
  config.py                      pydantic-settings Settings (env)
  contracts.py                   pydantic mirror of the charts-computed v1 JSON schema
  io/s3.py, io/loaders.py        S3 access, parsing and schema validation
  messaging/publisher.py         RabbitMQ publisher (pika)
  analytics/*.py                 pure analytics functions, registered in analytics.JOBS
  pipeline.py                    stage -> analyze -> build event -> publish, summarize
scripts/generate_sample_dataset.py  deterministic demo CSV for smoke tests
tests/                           pytest suite (no Airflow, S3 or RabbitMQ needed)
```

## Environment

| Variable               | Default            | Description                                         |
| ---------------------- | ------------------ | --------------------------------------------------- |
| `S3_ENDPOINT`          | AWS default        | S3 endpoint, e.g. `http://minio:9000`               |
| `S3_REGION`            | `ru-central1`      | S3 region                                           |
| `S3_BUCKET`            | required           | Bucket with raw uploads and staging data            |
| `S3_ACCESS_KEY_ID`     | required           | S3 access key                                       |
| `S3_SECRET_ACCESS_KEY` | required           | S3 secret key                                       |
| `S3_FORCE_PATH_STYLE`  | `false`            | Path-style addressing (`true` for MinIO)            |
| `S3_RAW_PREFIX`        | `raw-data`         | Only keys under this prefix are accepted            |
| `S3_STAGING_PREFIX`    | `staging`          | Prefix for per-run parquet files                    |
| `RABBITMQ_URL`         | required           | AMQP URL, e.g. `amqp://user:pass@rabbitmq:5672/`    |
| `RABBITMQ_EXCHANGE`    | `datashelf.events` | Topic exchange for `dataset.charts.computed` events |

See [`.env.example`](./.env.example). Airflow itself is configured with its usual `AIRFLOW__*` variables.

## Development

Requires [uv](https://docs.astral.sh/uv/); Python 3.12 is pinned in `.python-version` to match the image.

```sh
uv sync                          # runtime + dev dependencies
uv run pytest                    # tests with coverage (fails under 80%)
uv run ruff check                # lint
uv run ruff format --check       # formatting
uv run mypy                      # strict type check of src/
uv sync --group airflow          # optional: also run the DAG import test locally
uv run python scripts/generate_sample_dataset.py --rows 500 --output data/retail_sample.csv
```

## Docker

```sh
docker build -t datashelf-etl:test services/etl
```

The image extends `apache/airflow:3.3.2-python3.12`, installs this package with the official Airflow
constraints (runtime pins in `pyproject.toml` match them) and copies `dags/` to `/opt/airflow/dags`.
