variable "name" {
  description = "Name prefix"
  type        = string
}

variable "zone" {
  description = "Availability zone of the subnet"
  type        = string
}

variable "cidr" {
  description = "Subnet CIDR"
  type        = string
  default     = "10.10.0.0/24"
}

variable "admin_cidrs" {
  description = "CIDRs allowed to reach SSH and the Airflow UI"
  type        = list(string)

  validation {
    condition     = length(var.admin_cidrs) > 0 && !contains(var.admin_cidrs, "0.0.0.0/0")
    error_message = "admin_cidrs must list explicit operator networks, not 0.0.0.0/0."
  }
}

variable "labels" {
  description = "Resource labels"
  type        = map(string)
  default     = {}
}
