output "app_url" {
  description = "Web console, API and docs behind one HTTPS origin"
  value       = "https://${local.site_address}"
}

output "api_url" {
  description = "Base URL for API clients and the smoke test"
  value       = "https://${local.site_address}"
}

output "vm_public_ip" {
  value = module.network.public_ip
}

output "registry_url" {
  value = module.registry.registry_url
}

output "data_bucket" {
  value = module.storage.data_bucket
}

output "lockbox_secret_id" {
  description = "Read runtime credentials with: yc lockbox payload get <id>"
  value       = module.secrets.secret_id
}

output "ci_service_account_id" {
  value = module.iam.ci_service_account_id
}
