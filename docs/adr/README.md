# Architecture decision records

| #                                                                   | Decision                                          |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| [0001](0001-monorepo-with-pnpm-and-uv-workspaces.md)                | One monorepo managed by pnpm and uv               |
| [0002](0002-event-driven-chart-delivery-with-versioned-contract.md) | Computed charts as versioned events over RabbitMQ |
| [0003](0003-stage-intermediate-data-in-object-storage.md)           | Object keys in XCom, parquet staging in S3        |
| [0004](0004-single-vm-for-dev-environment.md)                       | Dev environment on one Container Optimized VM     |
| [0005](0005-rustfs-as-local-s3.md)                                  | RustFS as local S3                                |
| [0006](0006-environment-based-configuration.md)                     | Validated environment-based configuration         |
| [0007](0007-single-https-origin-in-the-cloud.md)                    | One HTTPS origin for web and API in the cloud     |

New records: copy the structure of an existing one (Context, Decision, Consequences, Alternatives considered),
use the next number, never rewrite an accepted record — supersede it.
