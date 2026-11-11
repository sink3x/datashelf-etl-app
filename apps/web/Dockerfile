# syntax=docker/dockerfile:1.7
# Build context is the repository root: docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS build

ENV PNPM_HOME=/pnpm \
	PATH=/pnpm:$PATH \
	HUSKY=0 \
	CI=true

RUN corepack enable && corepack prepare pnpm@10.34.9 --activate

WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile --filter "@datashelf/web..."

COPY packages/contracts packages/contracts
COPY apps/web apps/web

ARG VITE_API_MOCK=false
ARG VITE_BASE_PATH=/
ENV VITE_API_MOCK=$VITE_API_MOCK \
	VITE_BASE_PATH=$VITE_BASE_PATH

RUN pnpm --filter @datashelf/web build \
	&& find apps/web/build -name '*.br' -delete


FROM nginxinc/nginx-unprivileged:1.28-alpine AS runtime

ENV API_URL="" \
	DOCS_URL="" \
	CONTACT_URL="" \
	DEFAULT_DAG_ID="customer_data_etl"

COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --chmod=755 apps/web/docker/40-render-app-config.sh /docker-entrypoint.d/40-render-app-config.sh
COPY --from=build --chown=101:101 /repo/apps/web/build /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
