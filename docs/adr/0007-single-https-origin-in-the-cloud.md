# 0007. Serve the web console and the API from one HTTPS origin in the cloud

Date: 2026-11-11 Status: Accepted

## Context

The first cloud layout hosted the console in an Object Storage website bucket and exposed the API on the VM at
`http://<ip>:5000`. Browsers open the bucket over HTTPS (HTTPS-first mode), so every API call became mixed
content and was blocked; the end-to-end test from the command line passed while the dashboard was empty in a
real browser. Fixing it with a separate API certificate would still require CORS and a second public endpoint.

## Decision

The VM runs Caddy as the only public entry point on ports 80/443. It obtains a Let's Encrypt certificate for
`<ip-with-dashes>.sslip.io` (or a custom `domain` variable), routes `/api`, `/docs`, `/healthz` and `/readyz`
to the API container and everything else to the web container. The API port is no longer exposed; the web
bucket is removed.

## Consequences

- One origin: no CORS configuration, no mixed content, TLS everywhere, one URL to share.
- The smoke test now runs through the same HTTPS path a browser uses.
- The console is served by the VM instead of object storage — it shares the VM's availability.
- sslip.io is a third-party DNS service; production should use an owned domain via the `domain` variable.

## Alternatives considered

- API Gateway in front of the VM — request body limit is too small for dataset uploads.
- Application Load Balancer with Certificate Manager — the production answer, but costs more than the whole
  dev VM.
