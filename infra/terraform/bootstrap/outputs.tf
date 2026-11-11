output "state_bucket" {
  value = yandex_storage_bucket.state.bucket
}

output "terraform_service_account_id" {
  value = yandex_iam_service_account.terraform.id
}

output "state_access_key" {
  value     = yandex_iam_service_account_static_access_key.state.access_key
  sensitive = true
}

output "state_secret_key" {
  value     = yandex_iam_service_account_static_access_key.state.secret_key
  sensitive = true
}
