#!/bin/sh
# Renders the runtime config consumed by the console from container environment variables.
set -eu

target="${APP_CONFIG_PATH:-/usr/share/nginx/html/app-config.js}"

js_string() {
	printf '%s' "$1" | tr -d '\r\n' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/</\\u003c/g'
}

cat >"$target" <<CONFIG
window.appConfig = {
	services: {
		apiUrl: "$(js_string "${API_URL:-}")",
	},
	urls: {
		documentationUrl: "$(js_string "${DOCS_URL:-}")",
		contactUsUrl: "$(js_string "${CONTACT_URL:-}")",
	},
	vars: {
		defaultDagId: "$(js_string "${DEFAULT_DAG_ID:-customer_data_etl}")",
	},
}
CONFIG

echo "datashelf-web: rendered $target (API_URL=${API_URL:-<same origin>})"
