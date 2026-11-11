# @datashelf/api

Express 5 + TypeScript service that accepts dataset uploads, stores them in S3, triggers the Airflow ETL DAG
and serves the computed charts. Chart results arrive asynchronously as `dataset.charts.computed` events over
RabbitMQ and are persisted in MongoDB.

## Quick start

All commands run from the repository root.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # adjust values, never commit the copy
pnpm --filter @datashelf/api dev
```

The service needs MongoDB, RabbitMQ, an S3-compatible store (MinIO locally) and Airflow. It refuses to start
with an invalid environment and only begins listening once MongoDB and RabbitMQ are connected.

- API: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000/docs`
- Probes: `GET /healthz` (liveness), `GET /readyz` (MongoDB ping, RabbitMQ consumer, S3 `HeadBucket`)

## Scripts

| Script          | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `dev`           | Run from source with `tsx watch` (loads `apps/api/.env`)       |
| `build`         | Bundle to `build/index.cjs` with tsup, copy openapi and public |
| `start`         | Run the bundle (`node --enable-source-maps build/index.cjs`)   |
| `lint`          | ESLint                                                         |
| `typecheck`     | `tsc --noEmit` over `src` and `test`                           |
| `test`          | Vitest unit and HTTP tests (no network or running services)    |
| `test:coverage` | Tests with V8 coverage (`coverage/`)                           |

Run any of them with `pnpm --filter @datashelf/api <script>`.

## Environment

Configuration comes only from environment variables, validated with zod at startup. `.env` in `apps/api` is
loaded for local development; real environment variables always win.

| Variable               | Default                         | Notes                                               |
| ---------------------- | ------------------------------- | --------------------------------------------------- |
| `NODE_ENV`             | `development`                   | `development`, `production` or `test`               |
| `PORT`                 | `5000`                          |                                                     |
| `LOG_LEVEL`            | `info`                          | pino level, `silent` disables logs                  |
| `CORS_ORIGINS`         | `*`                             | Comma separated origins; `*` logs a warning in prod |
| `MONGODB_URI`          | required                        |                                                     |
| `MONGODB_DB`           | `datashelf`                     |                                                     |
| `RABBITMQ_URL`         | required                        |                                                     |
| `RABBITMQ_EXCHANGE`    | `datashelf.events`              | DLX is `<exchange>.dlx`                             |
| `RABBITMQ_QUEUE`       | `datashelf.api.charts-computed` | DLQ is `<queue>.dlq`                                |
| `RABBITMQ_PREFETCH`    | `10`                            | Unacked messages per consumer                       |
| `S3_ENDPOINT`          | required                        | e.g. `https://storage.yandexcloud.net`              |
| `S3_REGION`            | `ru-central1`                   |                                                     |
| `S3_BUCKET`            | required                        |                                                     |
| `S3_ACCESS_KEY_ID`     | required                        |                                                     |
| `S3_SECRET_ACCESS_KEY` | required                        |                                                     |
| `S3_FORCE_PATH_STYLE`  | `false`                         | `true` for MinIO                                    |
| `S3_RAW_PREFIX`        | `raw-data`                      | Key prefix for uploads                              |
| `UPLOAD_MAX_SIZE_MB`   | `10`                            |                                                     |
| `AIRFLOW_URL`          | required                        | Airflow 3 API server base URL                       |
| `AIRFLOW_USERNAME`     | required                        |                                                     |
| `AIRFLOW_PASSWORD`     | required                        |                                                     |
| `AIRFLOW_DAG_ID`       | `customer_data_etl`             | The only DAG `process-data` is allowed to trigger   |

## Architecture

```
src/
  index.ts          entry: parse config, create logger, start server
  server.ts         bootstrap (Mongo -> indexes -> RabbitMQ -> listen) and graceful stop on SIGTERM/SIGINT
  container.ts      composition root: builds every dependency, no DI library
  app.ts            express app factory (middleware, routes, docs, 404, error handler)
  config/           zod env schema
  routers/          route wiring + openapi yml next to each router
  controllers/      HTTP mapping, legacy response envelopes
  services/         use cases (airflow trigger, dataset queries, readiness)
  repositories/     MongoDB chart_results and S3 raw dataset access
  clients/          Airflow HTTP client, Mongo connection, S3 client
  messaging/        RabbitMQ consumer and charts-computed event handler
  middlewares/      request logging, validation, upload, errors
  errors/           AppError hierarchy
```

Request flow: `routes -> controllers -> services -> repositories/clients`. Controllers never touch drivers,
and services receive their dependencies through constructors, so tests replace them with plain objects.

### Messaging

The consumer declares the topology it owns and settles each message only after the awaited MongoDB write:

- exchange `datashelf.events` (topic, durable), routing key `dataset.charts.computed`
- queue `datashelf.api.charts-computed` (durable, `x-dead-letter-exchange: datashelf.events.dlx`)
- DLX `datashelf.events.dlx` (fanout, durable) bound to `datashelf.api.charts-computed.dlq`

Payloads are validated with `chartsComputedEventSchema` from `@datashelf/contracts`. Invalid JSON, contract
violations and storage failures are `nack`ed without requeue and land in the DLQ. After a broker disconnect
the consumer reconnects with exponential backoff, re-declares the topology and resumes; `/readyz` reports 503
meanwhile.

### Persistence

Collection `chart_results` stores one document per `(run_id, job)`:
`{ run_id, job, event_id, dataset { object_key, filename }, occurred_at, processing_time_sec, meta, charts[] }`
with a unique index on `(run_id, job)` and an index on `dataset.filename`. Indexes are created at startup.
Redelivered or older events for the same key are ignored, a newer event replaces the document.

`GET /api/dataset/processed` maps documents to the legacy shape (`filename = dataset.filename`,
`processed_at = occurred_at`, `chart = charts`). Documents in the pre-contract `charts` collection are not
read.

### HTTP errors

Every error response is `{ "message": string, "code": string, "details"?: unknown }`. Unexpected errors return
a generic 500 and are logged with the request id (`x-request-id` is accepted or generated and echoed back).
Stack traces never reach clients.

### Known limits

- `GET /api/dataset/raw` lists the prefix page by page (1000 keys per request) up to 10000 objects, sorts by
  `LastModified` and paginates in memory; `meta.truncated` is `true` when the cap is hit. A database index of
  uploads would be needed beyond that.
- `GET /api/dataset/processed` returns the 1000 most recent results.

## Docker

The image is built from the repository root so the workspace `@datashelf/contracts` package is available:

```bash
docker build -f apps/api/Dockerfile -t datashelf-api .
docker run --rm -p 5000:5000 --env-file apps/api/.env datashelf-api
```

`apps/api/Dockerfile.dockerignore` applies to that root context. The runtime stage is `node:22-alpine`, runs
as the `node` user with production dependencies only and has a `HEALTHCHECK` on `/healthz`.
