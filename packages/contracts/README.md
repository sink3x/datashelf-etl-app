# @datashelf/contracts

Message contracts exchanged between services. The JSON Schema in [`schemas/`](./schemas) is the source of
truth; the TypeScript (zod) and Python (pydantic) models mirror it and are tested against the shared
[`fixtures/`](./fixtures).

| Event                     | Producer           | Consumer | Idempotency key |
| ------------------------- | ------------------ | -------- | --------------- |
| `dataset.charts.computed` | ETL analytics task | API      | `(run_id, job)` |

Breaking changes bump `schema_version` and ship as a new schema file next to the old one.
