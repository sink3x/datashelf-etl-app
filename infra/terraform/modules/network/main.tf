resource "yandex_vpc_network" "this" {
  name   = "${var.name}-network"
  labels = var.labels
}

resource "yandex_vpc_subnet" "this" {
  name           = "${var.name}-${var.zone}"
  zone           = var.zone
  network_id     = yandex_vpc_network.this.id
  v4_cidr_blocks = [var.cidr]
  labels         = var.labels
}

resource "yandex_vpc_security_group" "app" {
  name       = "${var.name}-app"
  network_id = yandex_vpc_network.this.id
  labels     = var.labels

  ingress {
    description    = "HTTPS entry point (Caddy)"
    protocol       = "TCP"
    port           = 443
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "HTTP for ACME challenges and redirect to HTTPS"
    protocol       = "TCP"
    port           = 80
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "SSH for operators"
    protocol       = "TCP"
    port           = 22
    v4_cidr_blocks = var.admin_cidrs
  }

  ingress {
    description    = "Airflow UI for operators"
    protocol       = "TCP"
    port           = 8080
    v4_cidr_blocks = var.admin_cidrs
  }

  ingress {
    description       = "Traffic inside the security group"
    protocol          = "ANY"
    predefined_target = "self_security_group"
    from_port         = 0
    to_port           = 65535
  }

  egress {
    description    = "Outbound"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
    from_port      = 0
    to_port        = 65535
  }
}

resource "yandex_vpc_address" "public" {
  name = "${var.name}-ip"

  external_ipv4_address {
    zone_id = var.zone
  }
}
