output "registry_id" {
  value = yandex_container_registry.this.id
}

output "registry_url" {
  value = "cr.yandex/${yandex_container_registry.this.id}"
}
