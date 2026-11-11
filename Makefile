SHELL := /bin/bash
.DEFAULT_GOAL := help

ENV_FILE ?= $(if $(wildcard .env),.env,example.env)
export ENV_FILE

COMPOSE := docker compose --env-file $(ENV_FILE)
ETL := uv run --project services/etl

TF_DIR ?= infra/terraform/envs/dev
TF ?= terraform
export TF_CLI_CONFIG_FILE := $(CURDIR)/infra/terraform/cli.tfrc

IMAGE_TAG ?= $(shell git rev-parse --short HEAD)
PLATFORM ?=
PLATFORM_FLAG = $(if $(PLATFORM),--platform $(PLATFORM) --provenance=false --sbom=false)

##@ Setup

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage: make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2 } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)

.PHONY: env
env: ## Create .env from example.env (does not overwrite)
	@test -f .env && echo ".env already exists" || (cp example.env .env && echo "created .env")

.PHONY: install
install: ## Install JS (pnpm) and Python (uv) dependencies
	pnpm install --frozen-lockfile
	uv sync --project services/etl --all-groups

##@ Quality

.PHONY: lint
lint: ## Lint every package
	pnpm -r lint
	$(ETL) ruff check services/etl
	$(ETL) ruff format --check services/etl

.PHONY: typecheck
typecheck: ## Type-check TypeScript and Python
	pnpm -r typecheck
	cd services/etl && uv run mypy src

.PHONY: test
test: test-js test-py ## Run all unit and contract tests

.PHONY: test-js
test-js: ## Run vitest suites (contracts, api, web)
	pnpm -r test

.PHONY: test-py
test-py: ## Run pytest suite for the ETL service
	cd services/etl && uv run pytest

.PHONY: check
check: lint typecheck test ## Everything CI runs before building images

##@ Local stack (docker compose)

.PHONY: up
up: ## Build and start the full stack (web :3000, api :5000, airflow :8080)
	$(COMPOSE) up -d --build --wait

.PHONY: down
down: ## Stop the stack (keeps volumes)
	$(COMPOSE) down

.PHONY: nuke
nuke: ## Stop the stack and delete its volumes
	$(COMPOSE) down -v --remove-orphans

.PHONY: logs
logs: ## Follow logs (S=service to filter)
	$(COMPOSE) logs -f $(S)

.PHONY: ps
ps: ## Show service status
	$(COMPOSE) ps

.PHONY: sample
sample: ## Generate a demo retail dataset into research/data/sample.csv
	$(ETL) python services/etl/scripts/generate_sample_dataset.py --rows 2000 --output research/data/sample.csv

.PHONY: smoke
smoke: sample ## End-to-end check against the running stack: upload → DAG run → charts
	./scripts/smoke.sh http://localhost:5000 research/data/sample.csv

.PHONY: dev
dev: ## Run api + web in watch mode against the compose infrastructure
	$(COMPOSE) up -d --wait mongodb rabbitmq s3 s3-init airflow-apiserver airflow-scheduler airflow-dag-processor
	pnpm dev

##@ Images

.PHONY: images
images: ## Build production images tagged with IMAGE_TAG (PLATFORM=linux/amd64 for cloud VMs)
	docker build $(PLATFORM_FLAG) -f apps/api/Dockerfile -t datashelf-api:$(IMAGE_TAG) .
	docker build $(PLATFORM_FLAG) -f apps/web/Dockerfile -t datashelf-web:$(IMAGE_TAG) .
	docker build $(PLATFORM_FLAG) -t datashelf-etl:$(IMAGE_TAG) services/etl

##@ Cloud (Yandex Cloud)

.PHONY: tf-fmt
tf-fmt: ## Format Terraform code
	$(TF) fmt -recursive infra/terraform

.PHONY: tf-validate
tf-validate: ## Validate Terraform stacks and run tflint
	$(TF) fmt -check -recursive infra/terraform
	cd infra/terraform/bootstrap && $(TF) init -backend=false -input=false >/dev/null && $(TF) validate
	cd $(TF_DIR) && $(TF) init -backend=false -input=false >/dev/null && $(TF) validate
	cd infra/terraform && tflint --init >/dev/null && tflint --recursive

.PHONY: tf-init
tf-init: ## Init the environment with the remote state backend (needs backend.hcl)
	cd $(TF_DIR) && $(TF) init -backend-config=backend.hcl -input=false

.PHONY: tf-plan
tf-plan: ## Plan the environment (IMAGE_TAG selects images)
	cd $(TF_DIR) && $(TF) plan -var image_tag=$(IMAGE_TAG) -out=tfplan

.PHONY: tf-apply
tf-apply: ## Apply the saved plan
	cd $(TF_DIR) && $(TF) apply tfplan

.PHONY: tf-destroy
tf-destroy: ## Destroy the environment
	cd $(TF_DIR) && $(TF) destroy -var image_tag=$(IMAGE_TAG)

.PHONY: tf-registry
tf-registry: ## Create only the container registry (needed before the first push)
	cd $(TF_DIR) && $(TF) apply -auto-approve -input=false -var image_tag=$(IMAGE_TAG) -target=module.registry

.PHONY: cloud-push
cloud-push: PLATFORM = linux/amd64
cloud-push: images ## Build amd64 images and push them to Yandex Container Registry
	./scripts/cloud.sh push $(IMAGE_TAG)

.PHONY: cloud-web
cloud-web: ## Build the web console and upload it to the website bucket
	./scripts/cloud.sh web

.PHONY: cloud-smoke
cloud-smoke: sample ## Run the end-to-end smoke test against the cloud API
	./scripts/smoke.sh "$$(cd $(TF_DIR) && $(TF) output -raw api_url)" research/data/sample.csv

.PHONY: cloud-up
cloud-up: tf-registry cloud-push tf-plan tf-apply cloud-web ## Registry, images, infra, web — in that order

.PHONY: clean
clean: ## Remove build artifacts and caches
	rm -rf apps/*/build apps/*/coverage packages/*/coverage services/etl/.pytest_cache services/etl/.ruff_cache services/etl/.mypy_cache
