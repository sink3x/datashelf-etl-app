# One-time bootstrap: bucket for remote Terraform state and a service account that CI uses to run Terraform.
# Kept on local state on purpose — it creates the remote state backend for every other stack.

resource "yandex_iam_service_account" "terraform" {
  name        = "${var.project}-terraform"
  description = "Runs Terraform from GitHub Actions"
}

resource "yandex_resourcemanager_folder_iam_member" "terraform_admin" {
  folder_id = var.folder_id
  role      = "admin"
  member    = "serviceAccount:${yandex_iam_service_account.terraform.id}"
}

resource "yandex_iam_service_account_static_access_key" "state" {
  service_account_id = yandex_iam_service_account.terraform.id
  description        = "S3 backend access for Terraform state"
}

resource "yandex_storage_bucket" "state" {
  bucket     = "${var.project}-tfstate-${var.folder_id}"
  access_key = yandex_iam_service_account_static_access_key.state.access_key
  secret_key = yandex_iam_service_account_static_access_key.state.secret_key

  versioning {
    enabled = true
  }

  depends_on = [yandex_resourcemanager_folder_iam_member.terraform_admin]
}
