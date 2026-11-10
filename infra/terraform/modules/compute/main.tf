# Container Optimized Image runs the docker-compose spec passed through instance metadata,
# so a deploy is just "update metadata" — no configuration management on the host.
data "yandex_compute_image" "coi" {
  family    = "container-optimized-image"
  folder_id = "standard-images"
}

resource "yandex_vpc_address" "this" {
  name = "${var.name}-ip"

  external_ipv4_address {
    zone_id = var.zone
  }
}

resource "yandex_compute_instance" "this" {
  name               = "${var.name}-app"
  hostname           = "${var.name}-app"
  zone               = var.zone
  platform_id        = "standard-v3"
  service_account_id = var.service_account_id
  labels             = var.labels

  allow_stopping_for_update = true

  resources {
    cores         = var.cores
    memory        = var.memory_gb
    core_fraction = var.core_fraction
  }

  scheduling_policy {
    preemptible = var.preemptible
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.coi.id
      type     = "network-ssd"
      size     = var.disk_gb
    }
  }

  network_interface {
    subnet_id          = var.subnet_id
    security_group_ids = var.security_group_ids
    nat                = true
    nat_ip_address     = yandex_vpc_address.this.external_ipv4_address[0].address
  }

  metadata = {
    docker-compose = var.docker_compose
    user-data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
      ssh_user       = var.ssh_user
      ssh_public_key = var.ssh_public_key
    })
  }
}
