# Runtime secrets are generated here and stored in Lockbox, which is the source of truth
# operators read from (yc lockbox payload get). The VM receives them through instance metadata.
resource "random_password" "this" {
  for_each = toset(var.generated)

  length  = 32
  special = false
}

resource "yandex_lockbox_secret" "this" {
  name                = "${var.name}-runtime"
  description         = "Runtime credentials for ${var.name}"
  deletion_protection = var.deletion_protection
  labels              = var.labels
}

resource "yandex_lockbox_secret_version" "this" {
  secret_id = yandex_lockbox_secret.this.id

  dynamic "entries" {
    for_each = merge({ for k, v in random_password.this : k => v.result }, var.static)

    content {
      key        = entries.key
      text_value = entries.value
    }
  }
}
