variable "name" {
  description = "Name prefix"
  type        = string
}

variable "zone" {
  description = "Availability zone"
  type        = string
}

variable "subnet_id" {
  description = "Subnet for the VM"
  type        = string
}

variable "security_group_ids" {
  description = "Security groups attached to the VM"
  type        = list(string)
}

variable "service_account_id" {
  description = "Service account the VM runs as (pulls images)"
  type        = string
}

variable "docker_compose" {
  description = "Rendered docker-compose spec executed by the Container Optimized Image"
  type        = string
  sensitive   = true
}

variable "ssh_user" {
  description = "Operator login"
  type        = string
  default     = "datashelf"
}

variable "ssh_public_key" {
  description = "Operator SSH public key"
  type        = string
}

variable "cores" {
  description = "vCPU count"
  type        = number
  default     = 4
}

variable "memory_gb" {
  description = "RAM in GB"
  type        = number
  default     = 8
}

variable "core_fraction" {
  description = "Guaranteed vCPU share in percent"
  type        = number
  default     = 50
}

variable "preemptible" {
  description = "Use a cheaper preemptible VM (non-prod)"
  type        = bool
  default     = false
}

variable "disk_gb" {
  description = "Boot disk size; Docker volumes live here"
  type        = number
  default     = 40
}

variable "disk_type" {
  description = "Boot disk type: network-ssd, network-hdd or network-ssd-nonreplicated"
  type        = string
  default     = "network-ssd"
}

variable "labels" {
  description = "Resource labels"
  type        = map(string)
  default     = {}
}
