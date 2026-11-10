# Contributing

## Branching (git flow)

| Branch          | Purpose                                 | Merges into           |
| --------------- | --------------------------------------- | --------------------- |
| `main`          | Released code, every commit is tagged   | —                     |
| `develop`       | Integration branch for the next release | `release/*`           |
| `feature/*`     | One feature or refactoring              | `develop` (`--no-ff`) |
| `release/x.y.z` | Version bump, changelog, final fixes    | `main` + `develop`    |
| `hotfix/x.y.z`  | Urgent fix of a released version        | `main` + `develop`    |

Releases are tagged `vX.Y.Z` on `main`; the tag triggers the release workflow.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) are enforced by commitlint:

```
feat(api): consume charts events with idempotent upserts
fix(etl): handle empty datasets in monthly sales
docs: describe local smoke test
```

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `release`, `revert`,
`style`, `test`. Scopes match the workspace: `api`, `web`, `etl`, `contracts`, `infra`, `scripts`, `github`.

## Before opening a pull request

```bash
make check          # lint, typecheck, tests
make tf-validate    # when touching infra/
make up && make smoke  # when touching the data flow
```

- Contract changes: bump `schema_version`, add a new schema file and fixtures, keep the consumer compatible
  with the previous version until producers are migrated.
- New configuration: add it to `example.env`, the service README and, if deployed, the Terraform template.
- Significant decisions: add an ADR in `docs/adr`.
