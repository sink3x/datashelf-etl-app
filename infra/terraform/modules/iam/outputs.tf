output "vm_service_account_id" {
  value = yandex_iam_service_account.vm.id
}

output "app_service_account_id" {
  value = yandex_iam_service_account.app.id
}

output "ci_service_account_id" {
  value = yandex_iam_service_account.ci.id
}

output "app_access_key" {
  value     = yandex_iam_service_account_static_access_key.app.access_key
  sensitive = true
}

output "app_secret_key" {
  value     = yandex_iam_service_account_static_access_key.app.secret_key
  sensitive = true
}

output "role_bindings" {
  description = "Used to order resources after IAM has propagated"
  value       = [for b in yandex_resourcemanager_folder_iam_member.this : b.id]
}
