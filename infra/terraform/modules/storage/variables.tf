variable "name" {
  description = "Name prefix"
  type        = string
}

variable "suffix" {
  description = "Globally unique suffix for bucket names"
  type        = string
}

variable "access_key" {
  description = "Static access key used to manage buckets"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "Static secret key used to manage buckets"
  type        = string
  sensitive   = true
}

variable "staging_retention_days" {
  description = "Days to keep intermediate parquet files"
  type        = number
  default     = 7
}

variable "raw_retention_days" {
  description = "Days to keep uploaded raw datasets, 0 keeps them forever"
  type        = number
  default     = 0
}

variable "force_destroy" {
  description = "Allow destroying the data bucket with objects inside (non-prod only)"
  type        = bool
  default     = false
}
