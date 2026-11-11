# 0001. Keep all services in one monorepo managed by pnpm and uv

Date: 2026-11-10 Status: Accepted

## Context

The project started as four sibling folders (`backend`, `frontend`, `airflow`, `analytics`) with their own
lockfiles, husky hooks and commitlint configs. The API and the ETL exchange messages whose shape was defined
only implicitly in both codebases, so a change on one side silently broke the other. There was no single
command to lint, test or run the system.

## Decision

We use one repository with a pnpm workspace for TypeScript (`apps/*`, `packages/*`) and a uv project for the
Python ETL (`services/etl`). Shared tooling (commitlint, husky, lint-staged, prettier, editorconfig) lives at
the root. Cross-service contracts live in `packages/contracts` and are tested from both languages. A root
`Makefile` is the entry point for every workflow.

## Consequences

- One PR can change a contract and both of its sides atomically; CI checks everything together.
- One lockfile per ecosystem (`pnpm-lock.yaml`, `services/etl/uv.lock`) instead of one per folder.
- CI runs more jobs per change; path filters may be needed if the repo grows.
- Contributors need both Node (pnpm) and Python (uv) toolchains to run the full check locally.

## Alternatives considered

- Polyrepo per service — independent release cadence is not needed for a single product; contract drift is the
  bigger risk.
- Nx / Turborepo — task caching is not worth an extra tool at three packages; pnpm `-r` is enough.
