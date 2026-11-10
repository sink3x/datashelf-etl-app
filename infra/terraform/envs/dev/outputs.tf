output "api_url" {
  description = "Public API endpoint"
  value       = "http://${module.compute.public_ip}:5000"
}

output "web_url" {
  description = "Web console hosted on Object Storage"
  value       = module.storage.web_url
}

output "vm_public_ip" {
  value = module.compute.public_ip
}

output "registry_url" {
  value = module.registry.registry_url
}

output "data_bucket" {
  value = module.storage.data_bucket
}

output "web_bucket" {
  value = module.storage.web_bucket
}

output "lockbox_secret_id" {
  description = "Read runtime credentials with: yc lockbox payload get <id>"
  value       = module.secrets.secret_id
}

output "ci_service_account_id" {
  value = module.iam.ci_service_account_id
}

output "ci_access_key" {
  value     = module.iam.ci_access_key
  sensitive = true
}

output "ci_secret_key" {
  value     = module.iam.ci_secret_key
  sensitive = true
}
