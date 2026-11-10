locals {
  name = "${var.project}-${var.environment}"

  labels = {
    project     = var.project
    environment = var.environment
    managed-by  = "terraform"
  }
}

module "network" {
  source = "../../modules/network"

  name        = local.name
  zone        = var.zone
  admin_cidrs = var.admin_cidrs
  labels      = local.labels
}

module "iam" {
  source = "../../modules/iam"

  name      = local.name
  folder_id = var.folder_id
}

module "storage" {
  source = "../../modules/storage"

  name          = local.name
  suffix        = var.folder_id
  access_key    = module.iam.app_access_key
  secret_key    = module.iam.app_secret_key
  force_destroy = var.environment != "prod"

  depends_on = [module.iam]
}

module "registry" {
  source = "../../modules/registry"

  name   = local.name
  labels = local.labels
}

resource "random_bytes" "fernet_key" {
  length = 32
}

module "secrets" {
  source = "../../modules/secrets"

  name      = local.name
  generated = ["mongodb_password", "rabbitmq_password", "postgres_password", "airflow_password", "airflow_jwt_secret", "airflow_api_secret"]
  static = {
    airflow_fernet_key   = replace(replace(random_bytes.fernet_key.base64, "+", "-"), "/", "_")
    s3_access_key_id     = module.iam.app_access_key
    s3_secret_access_key = module.iam.app_secret_key
  }
  deletion_protection = var.environment == "prod"
  labels              = local.labels
}

module "compute" {
  source = "../../modules/compute"

  name               = local.name
  zone               = var.zone
  subnet_id          = module.network.subnet_id
  security_group_ids = [module.network.security_group_id]
  service_account_id = module.iam.vm_service_account_id
  ssh_public_key     = var.ssh_public_key
  preemptible        = var.preemptible
  cores              = var.vm_cores
  memory_gb          = var.vm_memory_gb
  labels             = local.labels

  docker_compose = templatefile("${path.module}/../../templates/docker-compose.vm.yml.tftpl", {
    registry      = module.registry.registry_url
    image_tag     = var.image_tag
    cors_origins  = join(",", concat(["http://${module.storage.web_bucket}.website.yandexcloud.net"], var.extra_cors_origins))
    s3_bucket     = module.storage.data_bucket
    secrets       = module.secrets.values
    airflow_user  = "datashelf"
    log_level     = var.log_level
    upload_max_mb = var.upload_max_size_mb
  })

  depends_on = [module.iam]
}
