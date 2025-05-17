FROM node:20-alpine AS builder
RUN npm install -g pnpm@10.11.0
WORKDIR /app
RUN corepack enable
COPY package* pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM alpine:3.18 AS run
RUN apk add --no-cache nodejs-current
WORKDIR /app
COPY --from=builder /app/build .
EXPOSE 5000
CMD ["node", "index.mjs"]