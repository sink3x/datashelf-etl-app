# 0004. Run the dev environment on one Container Optimized VM in Yandex Cloud

Date: 2026-11-10 Status: Accepted, amended by [ADR-0007](0007-single-https-origin-in-the-cloud.md) (web
console moved onto the VM)

## Context

The project needs a reproducible cloud environment for demos and end-to-end tests that can be created and
destroyed on demand at minimal cost. Yandex Cloud has no managed RabbitMQ and no managed Airflow offering
without a Kubernetes or Data Processing dependency; managed PostgreSQL and MongoDB clusters cost more than the
whole workload and take 10+ minutes to provision.

## Decision

Terraform provisions one Container Optimized Image VM that runs the backend compose spec from instance
metadata (API, Airflow components, PostgreSQL, MongoDB, RabbitMQ). Durable data and static assets use managed
services: Object Storage for datasets and the web console, Container Registry for images, Lockbox for
generated secrets. The VM pulls images through its service account, so no registry credentials exist on the
host.

## Consequences

- `make cloud-up` / `make tf-destroy` bring the whole environment up or down in minutes; preemptible VM keeps
  cost low.
- Single point of failure and no horizontal scaling — acceptable for dev, not for production.
- Secrets reach the VM through instance metadata, which folder viewers can read. Production should read
  Lockbox at runtime or use Serverless Containers with Lockbox bindings.
- Database state lives on the VM disk and is lost on destroy.

Production path: Managed Service for PostgreSQL (Airflow metadata), Managed MongoDB, Serverless Containers for
the API, Managed Kubernetes or Yandex Data Processing for Airflow workers, Certificate Manager + ALB for TLS.

## Alternatives considered

- Managed Kubernetes — correct for production, but a cluster plus node group is overkill and slow for a demo
  stack.
- Serverless Containers for the API only — still needs a host for Airflow and RabbitMQ.
