# 0003. Pass object keys through XCom and stage data as parquet in S3

Date: 2026-11-10 Status: Accepted

## Context

The original DAG downloaded the uploaded file, base64-encoded it into XCom, then pushed the whole dataframe as
JSON into XCom again. XCom is stored in the Airflow metadata database; every run copied the dataset twice into
Postgres and every analytics task deserialized it from JSON.

## Decision

The extract task reads the raw object, validates and normalizes it, and writes
`staging/<run_id>/dataset.parquet` to the data bucket. Only object keys travel through XCom. Analytics tasks
read the parquet file directly. A bucket lifecycle rule expires `staging/` after 7 days.

## Consequences

- The metadata database stays small; dataset size is bounded by worker memory, not by XCom limits.
- Parquet keeps dtypes, so analytics no longer re-parse dates and numbers.
- Every task needs S3 credentials and network access to object storage.
- Staged files are visible in the bucket and must be cleaned up (handled by lifecycle).

## Alternatives considered

- Custom XCom backend on S3 — hides the data flow inside Airflow config; explicit keys are easier to reason
  about.
- Shared volume between workers — does not work once workers run on different hosts.
