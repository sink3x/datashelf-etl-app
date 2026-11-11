#!/usr/bin/env bash
# Yandex Cloud helpers used by the Makefile and CI.
#   scripts/cloud.sh push <tag>   build amd64 datashelf-{api,etl} images and push them to Container Registry
#   scripts/cloud.sh web          build the web console for the cloud API and upload it to the website bucket
#   scripts/cloud.sh purge        delete all images from the registry so Terraform can destroy it
set -euo pipefail

TF_DIR="${TF_DIR:-infra/terraform/envs/dev}"
TF="${TF:-terraform}"

tf_output() { (cd "${TF_DIR}" && "${TF}" output -raw "$1"); }

push() {
  local tag="${1:?image tag required}"
  local registry
  registry="$(tf_output registry_url)"

  yc container registry configure-docker >/dev/null
  # Build and push in one step: amd64 for the cloud VM, single manifest (no attestations) for Container Registry.
  docker buildx build --platform linux/amd64 --provenance=false --sbom=false --push \
    -f apps/api/Dockerfile -t "${registry}/datashelf-api:${tag}" .
  docker buildx build --platform linux/amd64 --provenance=false --sbom=false --push \
    -t "${registry}/datashelf-etl:${tag}" services/etl
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
  local registry_id token api=https://container-registry.api.cloud.yandex.net/container-registry/v1
  registry_id="$(cd "${TF_DIR}" && "${TF}" show -json \
    | jq -r '[.. | objects | select(.type? == "yandex_container_registry") | .values.id] | first // empty')"
  [[ -n "${registry_id}" ]] || return 0
  token="${YC_TOKEN:-$(yc iam create-token)}"

  curl -fsS -H "Authorization: Bearer ${token}" "${api}/images?registryId=${registry_id}&pageSize=1000" \
    | jq -r '.images[]?.id' \
    | while read -r image_id; do
        curl -fsS -X DELETE -H "Authorization: Bearer ${token}" "${api}/images/${image_id}" >/dev/null
      done
}

case "${1:-}" in
  push) shift; push "$@" ;;
  web) web ;;
  purge) purge ;;
  *) echo "usage: $0 {push <tag>|web|purge}" >&2; exit 2 ;;
esac
