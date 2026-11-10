output "data_bucket" {
  value = yandex_storage_bucket.data.bucket
}

output "web_bucket" {
  value = yandex_storage_bucket.web.bucket
}

output "web_url" {
  value = "http://${yandex_storage_bucket.web.website_endpoint}"
}
