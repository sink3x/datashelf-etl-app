output "instance_id" {
  value = yandex_compute_instance.this.id
}

output "public_ip" {
  value = var.public_ip
}
