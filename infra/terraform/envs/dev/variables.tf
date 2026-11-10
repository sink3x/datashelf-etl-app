variable "cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
}

variable "folder_id" {
  description = "Folder that hosts the environment"
  type        = string
}

variable "zone" {
  description = "Availability zone"
  type        = string
  default     = "ru-central1-a"
}

variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "datashelf"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "environment must be one of dev, stage, prod."
  }
}

variable "admin_cidrs" {
  description = "Operator networks allowed to reach SSH and the Airflow UI"
  type        = list(string)
}

variable "ssh_public_key" {
  description = "Operator SSH public key"
  type        = string
}

variable "image_tag" {
  description = "Container image tag deployed to the VM (git SHA or release version)"
  type        = string
  default     = "latest"
}

variable "preemptible" {
  description = "Run the VM as preemptible to cut cost"
  type        = bool
  default     = true
}

variable "vm_cores" {
  description = "VM vCPU count"
  type        = number
  default     = 4
}

variable "vm_memory_gb" {
  description = "VM memory in GB"
  type        = number
  default     = 8
}

variable "extra_cors_origins" {
  description = "Additional origins allowed to call the API (e.g. GitHub Pages)"
  type        = list(string)
  default     = []
}

variable "log_level" {
  description = "API log level"
  type        = string
  default     = "info"
}

variable "upload_max_size_mb" {
  description = "Upload size limit for datasets"
  type        = number
  default     = 10
}
