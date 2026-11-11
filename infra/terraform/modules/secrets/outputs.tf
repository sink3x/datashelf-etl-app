output "secret_id" {
  value = yandex_lockbox_secret.this.id
}

output "values" {
  value     = merge({ for k, v in random_password.this : k => v.result }, var.static)
  sensitive = true
}
