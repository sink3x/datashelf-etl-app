# Technology stack

What is used where, and why. Versions are pinned in the lockfiles; the table lists the major lines.

## Map

```
datashelf/
├── apps/web            React · TypeScript · Vite        → browser console
├── apps/api            Node.js · Express · TypeScript    → REST API + event consumer
├── packages/contracts  JSON Schema · zod                 → message contracts shared by TS and Python
├── services/etl        Python · Airflow · pandas         → ETL pipeline
├── research            Jupyter · conda                   → exploratory notebooks, dataset generation
├── infra/terraform     Terraform · Yandex Cloud          → cloud infrastructure
├── docker-compose.yml  Docker                            → local stack with mocks
├── Makefile, scripts/  GNU Make · Bash                   → one entry point for every task
└── .github/workflows   GitHub Actions                    → CI, releases, deployments
```

## Frontend — `apps/web`

| Concern      | Choice                                        | Why                                                 |
| ------------ | --------------------------------------------- | --------------------------------------------------- |
| Language     | TypeScript (strict)                           | Typed API layer shared with backend contracts       |
| UI           | React 19, Gravity UI, Ant Design              | Component kits for a data-heavy console             |
| Charts       | @ant-design/plots, d3 (maps, word clouds)     | Declarative charts plus custom visualizations       |
| State        | MobX                                          | Small page stores without boilerplate               |
| Styling      | styled-components, design tokens in `styles/` | Co-located styles, theme in one place               |
| Routing      | React Router 7                                | Nested console layouts                              |
| Validation   | zod                                           | Runtime config is validated before the app renders  |
| Mock backend | MSW                                           | Same handlers in tests and in the GitHub Pages demo |
| Build        | Vite 6, SWC                                   | Fast dev server, small production bundle            |
| Tests        | Vitest, Testing Library, jsdom                | Component and page tests against MSW                |
| Runtime      | nginx (unprivileged) container                | Static hosting, config rendered from env at start   |

## Backend API — `apps/api`

| Concern        | Choice                          | Why                                                  |
| -------------- | ------------------------------- | ---------------------------------------------------- |
| Runtime        | Node.js 22 LTS                  | Current LTS                                          |
| Framework      | Express 5                       | Native async error propagation                       |
| Validation     | zod                             | Env, request and message validation with one library |
| Persistence    | MongoDB 7 + Mongoose            | Charts are schemaless documents keyed by run         |
| Messaging      | RabbitMQ (amqplib)              | Topic exchange, DLQ, manual acks                     |
| Object storage | AWS SDK v3 S3 client            | Works with Yandex Object Storage and RustFS          |
| Logging        | pino, pino-http                 | Structured JSON logs with request ids                |
| API docs       | OpenAPI + Swagger UI at `/docs` | Self-describing endpoints                            |
| Build          | tsup (esbuild)                  | Single bundled file for a small image                |
| Tests          | Vitest, supertest               | HTTP and consumer tests without real infrastructure  |

## Contracts — `packages/contracts`

JSON Schema (draft 2020-12) is the source of truth for `dataset.charts.computed`. The zod model (TypeScript)
and the pydantic model (Python) are both tested against the same fixtures, so a breaking change fails CI on
both sides.

## ETL — `services/etl`

| Concern       | Choice                                         | Why                                                     |
| ------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Orchestration | Apache Airflow 3 (TaskFlow API)                | Scheduling, retries, run history, REST API for triggers |
| Processing    | pandas, pyarrow (parquet)                      | Columnar staging that keeps dtypes                      |
| Packaging     | uv, `pyproject.toml`, `uv.lock`, src layout    | Reproducible environments, fast installs                |
| Config        | pydantic-settings                              | Typed env configuration                                 |
| Contracts     | pydantic v2                                    | Events validated before publishing                      |
| Messaging     | pika with publisher confirms                   | No silently dropped events                              |
| Quality       | ruff (lint + format), mypy, pytest, pytest-cov | One fast linter, static types, coverage gate            |

## Research — `research`

Jupyter notebooks for exploratory analysis and synthetic dataset generation, with a **conda** environment
(`environment.yml`, conda-forge). Conda is used only here: notebooks need the scientific stack with native
libraries, while services use uv for lean, locked production installs.

## Infrastructure — `infra/terraform`

| Concern        | Yandex Cloud service                           |
| -------------- | ---------------------------------------------- |
| Network        | VPC, subnet, security groups                   |
| Compute        | Container Optimized Image VM running compose   |
| Object storage | Data bucket (lifecycle rules), website bucket  |
| Images         | Container Registry with cleanup policies       |
| Secrets        | Lockbox                                        |
| Identity       | Service accounts with least-privilege roles    |
| State          | S3 backend in Object Storage (bootstrap stack) |

Checked with `terraform fmt`, `terraform validate` and `tflint`; providers come from the Yandex mirror
(`infra/terraform/cli.tfrc`), which works for Terraform and OpenTofu.

## Delivery

| Workflow           | Trigger                        | Result                                                                  |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `ci.yml`           | every PR, push to main/develop | lint, typecheck, tests, image builds, tf validate, gitleaks, actionlint |
| `release.yml`      | tag `vX.Y.Z`                   | images in GHCR, GitHub Release with notes                               |
| `pages.yml`        | push to main                   | live demo on GitHub Pages (mock API)                                    |
| `deploy-cloud.yml` | release published / manual     | images in Yandex CR, `terraform apply`, smoke test                      |

Branching follows git flow: `feature/*` → `develop` → `release/*` → `main` + tag. Commits follow Conventional
Commits, enforced by commitlint; formatting and linting run in a pre-commit hook.
