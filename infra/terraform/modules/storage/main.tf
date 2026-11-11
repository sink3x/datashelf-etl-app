resource "yandex_storage_bucket" "data" {
  bucket     = "${var.name}-data-${var.suffix}"
  access_key = var.access_key
  secret_key = var.secret_key

  anonymous_access_flags {
    read        = false
    list        = false
    config_read = false
  }

  lifecycle_rule {
    id      = "expire-staging"
    enabled = true

    filter {
      prefix = "staging/"
    }

    expiration {
      days = var.staging_retention_days
    }
  }

  lifecycle_rule {
    id      = "expire-raw"
    enabled = var.raw_retention_days > 0

    filter {
      prefix = "raw-data/"
    }

    expiration {
      days = max(var.raw_retention_days, 1)
    }
  }

  force_destroy = var.force_destroy
}
