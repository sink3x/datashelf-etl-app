# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-11-11

### Fixed

- CI: pin `astral-sh/setup-uv` to `v10.3.3`; the action no longer publishes a floating major tag, which broke
  the Python job and the cloud deployment smoke test.

## [1.0.0] - 2026-11-11

Re-architecture of the original monolith into a tested, deployable monorepo.

### Added

- `packages/contracts`: versioned JSON Schema for `dataset.charts.computed` with zod and pydantic models
  tested against shared fixtures.
- API: env configuration validated with zod, layered architecture with a composition root, pino logging, typed
  errors, request validation, `/healthz` and `/readyz`, graceful shutdown, OpenAPI docs, 77 tests.
- RabbitMQ topology with a topic exchange, consumer-owned queue and dead-letter queue; idempotent upserts by
  `(run_id, job)` and acks only after the write succeeds.
- ETL: Airflow 3 TaskFlow DAG, parquet staging in object storage, pure analytics functions, publisher
  confirms, input schema validation, failure summary task; uv, ruff, mypy, pytest (~99% coverage).
- Web: zod-validated runtime config, typed API layer, complete console pages, responsive layout, MSW mock
  mode, GitHub Pages build, Vitest suite, unprivileged nginx image.
- Web: internationalization with English and Russian locales, language switcher and locale-aware formatting.
- Local stack in docker compose with an S3-compatible mock (RustFS), health checks and configurable ports;
  `make` targets for every workflow and an end-to-end smoke test.
- Terraform for Yandex Cloud: network, IAM, object storage, container registry, Lockbox and a Container
  Optimized VM, plus a bootstrap stack for remote state. Caddy serves the console, API and docs from one HTTPS
  origin with a Let's Encrypt certificate.
- GitHub Actions: CI (TypeScript, Python, Terraform, Docker, gitleaks, actionlint), releases to GHCR, GitHub
  Pages demo, gated Yandex Cloud deployment with smoke test.
- Documentation: architecture (C4, sequence, DAG diagrams), stack overview, ADRs, runbook, contributing guide.
- Research notebooks get a conda environment.

### Changed

- Repository reorganized into `apps/`, `packages/`, `services/`, `research/` and `infra/` with shared tooling
  at the root.
- Charts are stored in the `chart_results` collection; API errors from Airflow map to 502/404 instead of 500.
- Seasonal top-product charts are published only by the seasons job.

### Removed

- JSON configuration files and the build-time import of a git-ignored config.
- Passing whole datasets through Airflow XCom.

### Security

- Leaked credentials purged from git history; secret scanning runs in CI.

## [0.1.0] - 2025-06-13

Original monolithic prototype: Express API, Airflow DAG with analytics jobs, React dashboard.

[1.0.1]: https://github.com/sink3x/datashelf-etl-app/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/sink3x/datashelf-etl-app/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/sink3x/datashelf-etl-app/releases/tag/v0.1.0
