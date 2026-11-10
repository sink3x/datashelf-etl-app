# 0002. Deliver computed charts as versioned events over RabbitMQ

Date: 2026-11-10 Status: Accepted

## Context

Airflow tasks published free-form JSON to a RabbitMQ queue and the API inserted it into MongoDB. The consumer
acked messages before the asynchronous insert finished, so a database error lost data. Retried Airflow tasks
produced duplicate documents. Producer and consumer declared the queue independently, and the payload had no
schema.

## Decision

We publish `dataset.charts.computed` events to the topic exchange `datashelf.events`. The JSON Schema in
`packages/contracts` is the source of truth; zod (API) and pydantic (ETL) models are tested against shared
fixtures. The producer uses publisher confirms and `mandatory` so an unroutable message fails the Airflow task
and triggers a retry. The API owns its queue, acks only after the MongoDB upsert completes, upserts by the
idempotency key `(run_id, job)`, and dead-letters invalid messages to `datashelf.api.charts-computed.dlq`.

## Consequences

- At-least-once delivery with idempotent writes: retries are safe, nothing is silently dropped.
- Poison messages are kept in the DLQ for inspection instead of blocking the queue.
- Schema changes require a new `schema_version` and a migration window on the consumer.
- If the API has never started (queue not declared), producers fail until it does — an explicit, visible
  failure.

## Alternatives considered

- ETL writes directly to MongoDB — couples Airflow to the API's storage model and credentials.
- API polls Airflow XCom for results — moves large payloads through the Airflow metadata DB.
- Kafka — durable log and replay are not needed at this scale; RabbitMQ is simpler to run on one VM.
