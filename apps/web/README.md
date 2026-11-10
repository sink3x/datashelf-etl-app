# Datashelf web console

React 19 + TypeScript console for Datashelf. Upload a retail dataset, follow the Airflow run that processes it
and explore the resulting analytics dashboard. The same build can run against the real API or, for a static
demo, against an in-browser mock API.

## Features

- **Dashboard** per uploaded file: a metric strip (total sales, transactions, average sale, customers, best
  month) and chart sections for sales, customers and seasonal products. Charts the dashboard has no slot for
  still render in an "Other charts" section, and each chart can be downloaded as a PNG.
- **Storage**: paginated list of raw files in object storage, each linking to its dashboard.
- **Upload**: drag-and-drop CSV or JSON upload that triggers the `DEFAULT_DAG_ID` pipeline and tracks the run
  from queued to success.
- **Pipelines**: DAGs registered in Airflow plus the runs started from this browser. The API has no run
  history endpoint, so runs are remembered in `localStorage` and polled through the DAG status endpoint.
- Loading, empty and error states on every data page, responsive layout down to 375px, keyboard focus styles
  and a skip link.
- Runtime configuration validated with zod at startup; an invalid config renders an explanation instead of a
  blank page.

Chart payloads are typed with `TChart` from [`@datashelf/contracts`](../../packages/contracts).

## Scripts

Run from the repository root with `pnpm --filter @datashelf/web <script>` or inside `apps/web` with
`pnpm <script>`.

| Script          | What it does                                                       |
| --------------- | ------------------------------------------------------------------ |
| `dev`           | Vite dev server on port 3000 (eslint runs as a dev-server plugin). |
| `build`         | Production build into `build/`.                                    |
| `build:demo`    | Mock-backed build for GitHub Pages (`vite build --mode demo`).     |
| `preview`       | Serve `build/` locally.                                            |
| `preview:demo`  | Serve a `build:demo` output under its base path.                   |
| `lint`          | ESLint for the whole package.                                      |
| `typecheck`     | `tsc -p tsconfig.app.json --noEmit`.                               |
| `test`          | Vitest (jsdom) once.                                               |
| `test:watch`    | Vitest in watch mode.                                              |
| `test:coverage` | Vitest with V8 coverage (`coverage/`).                             |
| `stylelint`     | Stylelint for styled-components files.                             |

## Runtime configuration

`index.html` loads `app-config.js` (resolved against the base path) before the app bundle. The file sets
`window.appConfig`, which is validated by [`config.schema.ts`](src/shared/config/config.schema.ts) before the
app is imported. For local development edit [`public/app-config.js`](public/app-config.js). The Docker image
regenerates the file on every start from these environment variables:

| Variable         | `window.appConfig` field | Default             | Notes                                                            |
| ---------------- | ------------------------ | ------------------- | ---------------------------------------------------------------- |
| `API_URL`        | `services.apiUrl`        | empty (same origin) | Base URL of the Datashelf API, without `/api`.                   |
| `DOCS_URL`       | `urls.documentationUrl`  | empty               | API documentation link in the sidebar; hidden when empty.        |
| `CONTACT_URL`    | `urls.contactUsUrl`      | empty               | Contact link on the landing page and sidebar; hidden when empty. |
| `DEFAULT_DAG_ID` | `vars.defaultDagId`      | `customer_data_etl` | DAG triggered by uploads.                                        |

`urls.geographyAtlasUrl` (US states TopoJSON for the sales map) defaults to the `us-atlas` package on jsDelivr
and can be overridden in `app-config.js`.

Build-time variables:

| Variable         | Default | Notes                                            |
| ---------------- | ------- | ------------------------------------------------ |
| `VITE_BASE_PATH` | `/`     | Vite `base` and React Router `basename`.         |
| `VITE_API_MOCK`  | `false` | `true` starts the MSW mock API before rendering. |

## Mock mode

With `VITE_API_MOCK=true` the console registers [MSW](https://mswjs.io) (`public/mockServiceWorker.js`) and
answers every API call the UI makes from [`src/mocks`](src/mocks):

- fixture datasets whose charts use the chart names the ETL publishes (`total_sales`, `monthly_sales`,
  `city_sales_summary`, `top5_products_<season>`, ...) and pass the shared contract schema;
- uploads create a simulated DAG run that is `queued` for a few seconds, then `running`, then `success`, after
  which the new file appears in storage with its own dashboard;
- uploaded files and runs survive a reload through `localStorage`.

A "Demo mode — mock data" badge is shown in the sidebar. Regular builds do not include the worker or the mock
code.

The same handlers back the tests through `msw/node`.

### GitHub Pages

```sh
pnpm --filter @datashelf/web build:demo
pnpm --filter @datashelf/web preview:demo   # http://localhost:3000/datashelf-etl-app/
```

`build:demo` reads [`.env.demo`](.env.demo) (`VITE_API_MOCK=true`, `VITE_BASE_PATH=/datashelf-etl-app/`),
replaces `app-config.js` with [`config/app-config.demo.js`](config/app-config.demo.js) and copies `index.html`
to `404.html` so deep links work on GitHub Pages. Publish the `build/` directory.

## Docker

The build context is the repository root:

```sh
docker build -f apps/web/Dockerfile -t datashelf-web .
docker run --rm -p 3000:8080 -e API_URL=http://localhost:5000 -e DOCS_URL=http://localhost:5000/docs datashelf-web
```

The image is based on `nginxinc/nginx-unprivileged` (runs as uid 101, listens on 8080) and:

- renders `app-config.js` from the environment through `/docker-entrypoint.d/40-render-app-config.sh`;
- serves the SPA with an `index.html` fallback and precompressed gzip files;
- caches hashed files under `/js/` and `/assets/` for a year, never caches `index.html` or `app-config.js`;
- sends CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` headers;
- exposes `GET /healthz` for the Docker healthcheck.

Pass `--build-arg VITE_API_MOCK=true` to build a self-contained demo image.

## Tests

Vitest with jsdom and Testing Library. The suite covers config parsing, chart adapters and metric formatting,
dashboard layout building, API error messages, the simulated DAG run, contract validity of the mock fixtures,
`MetricCard`, `ChartCard` and the dashboard page against the MSW handlers (success, empty and error states).

## Screenshots

Screenshots are not committed yet. Good candidates: the dashboard for a seeded demo file, the upload run
tracker, the pipelines page and the mobile navigation drawer.
