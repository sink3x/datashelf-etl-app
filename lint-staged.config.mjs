export default {
  'apps/api/**/*.ts': () => 'pnpm --filter @datashelf/api lint',
  'apps/web/**/*.{ts,tsx}': () => 'pnpm --filter @datashelf/web lint',
  'services/etl/**/*.py': () => 'uv run --project services/etl ruff check services/etl',
  '**/*.{json,md,yml,yaml}': 'prettier --write',
}
