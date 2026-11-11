# Architecture

Datashelf turns a raw retail dataset (CSV or JSON) into an analytics dashboard. A user uploads a file in the
web console, an Airflow pipeline computes the analytics, and the dashboard renders the result in seconds.

## System context (C4 level 1)

```mermaid
flowchart LR
  user([Analyst])
  subgraph datashelf [Datashelf]
    web[Web console]
    api[API]
    etl[ETL pipeline]
  end
  s3[(Object storage)]
  user -- uploads datasets, explores charts --> web
  web -- REST/JSON --> api
  api -- stores raw files --> s3
  api -- triggers runs --> etl
  etl -- reads raw, writes staging --> s3
  etl -- charts computed events --> api
```

## Containers (C4 level 2)

```mermaid
flowchart TB
  subgraph client [Browser]
    web["<b>Web console</b><br/>React 19 · TypeScript · Vite<br/>MobX · Ant Design charts"]
  end

  subgraph backend [Backend]
    api["<b>API</b><br/>Node.js 22 · Express 5 · TypeScript<br/>zod · pino · Mongoose"]
    mq{{"<b>RabbitMQ</b><br/>exchange datashelf.events<br/>queue + DLQ"}}
    mongo[("<b>MongoDB</b><br/>chart_results")]
    subgraph airflow [Apache Airflow 3]
      apiserver[api-server]
      scheduler[scheduler · LocalExecutor]
      dagproc[dag-processor]
      pg[("PostgreSQL<br/>metadata")]
    end
  end

  s3[("<b>Object storage</b><br/>raw-data/ · staging/")]

  web -- "HTTP /api" --> api
  api -- "PUT raw-data/&lt;file&gt;" --> s3
  api -- "POST /api/v2/dags/{id}/dagRuns<br/>conf.object_key" --> apiserver
  scheduler -- "parquet in/out" --> s3
  scheduler -- "publish dataset.charts.computed<br/>(publisher confirms)" --> mq
  mq -- "consume, validate,<br/>ack after upsert" --> api
  api -- "upsert by (run_id, job)" --> mongo
  apiserver & scheduler & dagproc --- pg
```

## Request flow

```mermaid
sequenceDiagram
  autonumber
  actor U as Analyst
  participant W as Web
  participant A as API
  participant S as Object storage
  participant F as Airflow
  participant Q as RabbitMQ
  participant M as MongoDB

  U->>W: choose file, press Process
  W->>A: POST /api/airflow/process-data (multipart)
  A->>A: validate type, size, dagId
  A->>S: PutObject raw-data/<name>-<ts>.csv
  A->>F: create DAG run {object_key}
  A-->>W: 200 {dag_run_id}
  loop until finished
    W->>A: GET /api/airflow/dags/:dag/dagRuns/:run
    A->>F: run state
  end
  F->>S: extract → staging/<run_id>/dataset.parquet
  par each analytics task
    F->>S: read parquet
    F->>Q: dataset.charts.computed (job, charts[])
  end
  Q->>A: deliver event
  A->>A: zod validation (invalid → DLQ)
  A->>M: upsert {run_id, job}
  A->>Q: ack
  W->>A: GET /api/dataset/charts/:filename
  A->>M: find by dataset.filename
  A-->>W: charts grouped by name
```

## ETL pipeline

```mermaid
flowchart LR
  extract["extract<br/>validate schema, normalize,<br/>write parquet"] --> a1[retail_metrics]
  extract --> a2[monthly_sales]
  extract --> a3[seasons]
  extract --> a4[city_summary]
  extract --> a5[category / payment / store type]
  extract --> a6[word clouds]
  a1 & a2 & a3 & a4 & a5 & a6 --> summarize["summarize<br/>trigger_rule=all_done"]
```

Each analytics task is a pure `DataFrame → charts` function wrapped by a thin Airflow task, so the analytics
are unit-tested without Airflow. Tasks retry with backoff; publishing is idempotent thanks to the
`(run_id, job)` key. See [services/etl/README.md](../services/etl/README.md) for the exact task list.

## Reliability decisions

| Concern                 | Mechanism                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Lost results            | Publisher confirms + `mandatory`; consumer acks only after the DB write                                          |
| Duplicates from retries | Unique index and upsert on `(run_id, job)`                                                                       |
| Malformed messages      | Schema validation, `nack(requeue=false)` → dead-letter queue                                                     |
| Large datasets          | Parquet in object storage, only keys in XCom ([ADR-0003](adr/0003-stage-intermediate-data-in-object-storage.md)) |
| Broken configuration    | Validated env at startup, process exits with a readable error                                                    |
| Dependency outages      | `/readyz` checks MongoDB, RabbitMQ and S3; consumer reconnects with backoff                                      |
| Shutdown                | SIGTERM stops consuming, drains HTTP, closes connections                                                         |

## Deployment views

| Environment  | Entry point                                | Backend                                                    | Storage          |
| ------------ | ------------------------------------------ | ---------------------------------------------------------- | ---------------- |
| Local        | web `:3000`, API `:5000`                   | docker compose: API, Airflow ×4, Postgres, Mongo, RabbitMQ | RustFS (S3 mock) |
| Demo         | GitHub Pages, mock API (MSW)               | —                                                          | —                |
| Yandex Cloud | Caddy with Let's Encrypt, one HTTPS origin | Container Optimized VM running the same compose spec       | Object Storage   |

In the cloud, Caddy routes `/api`, `/docs`, `/healthz` and `/readyz` to the API and everything else to the web
container, so the browser talks to a single origin: no CORS, no mixed content
([ADR-0007](adr/0007-single-https-origin-in-the-cloud.md)).

Infrastructure details: [infra/terraform/README.md](../infra/terraform/README.md) and
[ADR-0004](adr/0004-single-vm-for-dev-environment.md).
