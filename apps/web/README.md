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
- English and Russian interface with an EN / RU switcher and locale-aware number, currency, file size and date
  formatting (see [Internationalization](#internationalization)).

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

A "Demo mode" badge is shown in the sidebar and the mobile bar. Regular builds do not include the worker or
the mock code.

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

## Internationalization

The console uses [i18next](https://www.i18next.com) with [react-i18next](https://react.i18next.com).
Everything lives in [`src/shared/i18n`](src/shared/i18n):

- `locales/en.json` and `locales/ru.json` are bundled with the app and loaded synchronously, so translations
  work offline and in the mock demo without extra requests. English is the default and fallback language.
- The language is detected from the `?lng=` query parameter, then `localStorage` (`datashelf.language`), then
  the browser. A choice made in the switcher is saved to `localStorage`, and `<html lang>` follows the active
  language.
- [`src/@types/i18next.d.ts`](src/@types/i18next.d.ts) types the resources from `en.json`, so `t()` and
  `<Trans>` keys are checked by `tsc`.
- Formatting goes through `Intl` and luxon with the locale from `useLanguage()` (`en-US` or `ru-RU`):
  [`format-number.ts`](src/utils/format-number.ts), [`convert-file-size.ts`](src/utils/convert-file-size.ts)
  and [`format-date.ts`](src/utils/format-date.ts) take the locale as an argument.
- antd components receive the matching antd locale through `ConfigProvider`.

Chart titles and descriptions come from the API and are shown as they are.

### Key conventions

- Keys are grouped by screen or component (`dashboard.*`, `upload.*`, `nav.*`); strings shared by several
  screens live in `common.*`. Use camelCase segments.
- Use `{{name}}` interpolation instead of concatenating strings, and `<Trans>` with named components
  (`<code>`) for markup inside a sentence.
- Counted strings use i18next plural suffixes. English needs `_one` and `_other`; Russian needs `_one`,
  `_few`, `_many` and `_other`. Call `t('dashboard.chartCount', { count })` with the base key.
- Module-level constants (routes, dashboard sections, landing cards) store keys or ids, not text, and are
  translated at render time so they follow a language switch.
- [`locales.test.ts`](src/shared/i18n/locales/locales.test.ts) fails when a locale misses a key, a plural
  category of its language or a placeholder used in English.

### Adding a language

1. Add the code to `SUPPORTED_LANGUAGES` and its `Intl` locale to `INTL_LOCALES` in
   [`i18n.constants.ts`](src/shared/i18n/i18n.constants.ts).
2. Create `locales/<code>.json` with the same keys as `en.json` and the plural categories the language needs
   (`new Intl.PluralRules('<locale>').resolvedOptions().pluralCategories`).
3. Register the file in `resources` in [`i18n.ts`](src/shared/i18n/i18n.ts), add the antd locale to
   `ANTD_LOCALES` in [`App.tsx`](src/App.tsx) and import the file into `LOCALES` in `locales.test.ts` (`tsc`
   reports both maps as incomplete until you do).
4. Run `pnpm --filter @datashelf/web test`. The switcher picks the new language up from `SUPPORTED_LANGUAGES`
   and labels it with its native name from `Intl.DisplayNames`.

## Tests

Vitest with jsdom and Testing Library. The suite covers config parsing, chart adapters and metric formatting,
dashboard layout building, API error messages, the simulated DAG run, contract validity of the mock fixtures,
`MetricCard`, `ChartCard` and the dashboard page against the MSW handlers (success, empty and error states),
locale parity between `en.json` and `ru.json`, the language switcher and locale-aware formatting. Render
components that use translations with `renderWithI18n` from [`src/test/render.tsx`](src/test/render.tsx).

## Screenshots

Screenshots are not committed yet. Good candidates: the dashboard for a seeded demo file, the upload run
tracker, the pipelines page and the mobile navigation drawer.
