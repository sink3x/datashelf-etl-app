output "network_id" {
  value = yandex_vpc_network.this.id
}

output "subnet_id" {
  value = yandex_vpc_subnet.this.id
}

output "security_group_id" {
  value = yandex_vpc_security_group.app.id
}

output "public_ip" {
  value = yandex_vpc_address.public.external_ipv4_address[0].address
}
