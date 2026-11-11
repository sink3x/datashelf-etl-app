# 0005. Use RustFS as the local S3-compatible object storage

Date: 2026-11-10 Status: Accepted

## Context

Local development and CI need an S3-compatible endpoint so nothing talks to the real cloud. MinIO, the usual
choice, stopped publishing community Docker images, and the previous setup required real Yandex Object Storage
credentials even for local runs.

## Decision

The compose stack runs `rustfs/rustfs` (Apache-2.0, S3 API compatible) as service `s3`, and a one-shot
`aws-cli` container creates the bucket. Services switch between RustFS and Yandex Object Storage purely
through `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` and credentials.

## Consequences

- `make up` works offline from any cloud account; no real credentials are needed for development.
- Application code uses the plain S3 API, so the cloud swap is configuration only.
- RustFS is younger than MinIO; edge-case API differences may surface and are covered by the cloud smoke test.
- Local region is `us-east-1` (RustFS default) while the cloud uses `ru-central1`.

## Alternatives considered

- Pinned old MinIO image — no security updates.
- LocalStack — heavier, emulates far more than S3, and its licensing changed.
- Stubbing S3 in tests only — would not exercise the real upload → DAG → charts path locally.
