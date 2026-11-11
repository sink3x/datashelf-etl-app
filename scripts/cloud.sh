#!/usr/bin/env bash
# Yandex Cloud helpers used by the Makefile and CI.
#   scripts/cloud.sh push <tag>   push datashelf-{api,etl} images to Container Registry
#   scripts/cloud.sh web          build the web console for the cloud API and upload it to the website bucket
#   scripts/cloud.sh purge        delete all images from the registry so Terraform can destroy it
set -euo pipefail

TF_DIR="${TF_DIR:-infra/terraform/envs/dev}"
TF="${TF:-terraform}"

tf_output() { (cd "${TF_DIR}" && "${TF}" output -raw "$1"); }

push() {
  local tag="${1:?image tag required}"
  local registry
  registry="$(tf_output registry_url 2>/dev/null || yc container registry get --name datashelf-dev-registry --format json | jq -r '"cr.yandex/" + .id')"

  yc container registry configure-docker >/dev/null
  for image in datashelf-api datashelf-etl; do
    docker tag "${image}:${tag}" "${registry}/${image}:${tag}"
    docker push "${registry}/${image}:${tag}"
  done
}

web() {
  local api_url bucket
  api_url="$(tf_output api_url)"
  bucket="$(tf_output web_bucket)"

  pnpm --filter @datashelf/web build
  cat >apps/web/build/app-config.js <<EOF
window.appConfig = {
  services: { apiUrl: '${api_url}' },
  urls: {
    contactUsUrl: 'https://github.com/sink3x',
    documentationUrl: '${api_url}/docs',
  },
  vars: { defaultDagId: 'customer_data_etl' },
}
EOF

  AWS_ACCESS_KEY_ID="$(tf_output ci_access_key)" \
  AWS_SECRET_ACCESS_KEY="$(tf_output ci_secret_key)" \
  AWS_DEFAULT_REGION=ru-central1 \
    aws --endpoint-url https://storage.yandexcloud.net s3 sync --delete apps/web/build "s3://${bucket}"
}

purge() {
  local registry_id
  registry_id="$(cd "${TF_DIR}" && "${TF}" show -json \
    | jq -r '[.. | objects | select(.type? == "yandex_container_registry") | .values.id] | first // empty')"
  [[ -n "${registry_id}" ]] || return 0
  yc container image list --registry-id "${registry_id}" --format json \
    | jq -r '.[].id' \
    | while read -r image_id; do yc container image delete "${image_id}" >/dev/null; done
}

case "${1:-}" in
  push) shift; push "$@" ;;
  web) web ;;
  purge) purge ;;
  *) echo "usage: $0 {push <tag>|web|purge}" >&2; exit 2 ;;
esac
