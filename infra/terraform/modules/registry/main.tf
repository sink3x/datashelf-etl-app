resource "yandex_container_registry" "this" {
  name   = "${var.name}-registry"
  labels = var.labels
}

resource "yandex_container_repository_lifecycle_policy" "cleanup" {
  for_each = toset(var.repositories)

  name          = "keep-recent"
  status        = "active"
  repository_id = yandex_container_repository.this[each.key].id

  rule {
    description   = "Drop untagged layers"
    untagged      = true
    expire_period = "48h"
  }

  rule {
    description   = "Keep the latest tagged images"
    tag_regexp    = ".*"
    untagged      = false
    expire_period = "720h"
    retained_top  = var.retained_images
  }
}

resource "yandex_container_repository" "this" {
  for_each = toset(var.repositories)

  name = "${yandex_container_registry.this.id}/${each.key}"
}
