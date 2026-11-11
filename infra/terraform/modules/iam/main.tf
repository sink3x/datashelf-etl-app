# Least-privilege identities: the VM pulls images and reads secrets, the app reads/writes its bucket,
# CI pushes images.

resource "yandex_iam_service_account" "vm" {
  name        = "${var.name}-vm"
  description = "Identity of the application VM"
}

resource "yandex_iam_service_account" "app" {
  name        = "${var.name}-app"
  description = "S3 access for the API and the ETL workers"
}

resource "yandex_iam_service_account" "ci" {
  name        = "${var.name}-ci"
  description = "GitHub Actions: pushes images"
}

locals {
  folder_roles = {
    vm_puller   = { sa = yandex_iam_service_account.vm.id, role = "container-registry.images.puller" }
    vm_lockbox  = { sa = yandex_iam_service_account.vm.id, role = "lockbox.payloadViewer" }
    app_storage = { sa = yandex_iam_service_account.app.id, role = "storage.editor" }
    ci_pusher   = { sa = yandex_iam_service_account.ci.id, role = "container-registry.images.pusher" }
  }
}

resource "yandex_resourcemanager_folder_iam_member" "this" {
  for_each = local.folder_roles

  folder_id = var.folder_id
  role      = each.value.role
  member    = "serviceAccount:${each.value.sa}"
}

resource "yandex_iam_service_account_static_access_key" "app" {
  service_account_id = yandex_iam_service_account.app.id
  description        = "S3 credentials consumed by the API and ETL"
}
