# 0006. Configure services through validated environment variables

Date: 2026-11-10 Status: Accepted

## Context

The API imported a git-ignored `configs/app.local.json` at build time, so a clean checkout, Docker build or CI
run failed, and production configuration returned `null`. The ETL loaded a similar JSON file and raised
`NotImplementedError` in production. Real credentials had been committed to these files in the past.

## Decision

Every service reads twelve-factor environment variables and validates them at startup — zod in the API,
pydantic-settings in the ETL, a zod-validated runtime `window.appConfig` in the web console. Variable names
are shared across compose, Terraform templates and CI. Committed examples (`example.env`, service READMEs)
contain throwaway values only; gitleaks runs in CI on the full history.

## Consequences

- Images are environment-agnostic: the same build runs locally, in CI and in the cloud.
- A missing or malformed variable fails fast with a readable message instead of a runtime `undefined`.
- Variable names are an interface: renaming one touches compose, Terraform and docs together.

## Alternatives considered

- Per-environment JSON files baked into images — leaks secrets into images and requires a rebuild per
  environment.
- Fetching config from Lockbox at startup — better for production; tracked as a follow-up in ADR-0004.
