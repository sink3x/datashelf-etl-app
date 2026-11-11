variable "name" {
  description = "Name prefix"
  type        = string
}

variable "generated" {
  description = "Keys that get a random 32-character value"
  type        = list(string)
}

variable "static" {
  description = "Externally provided secret values"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "deletion_protection" {
  description = "Protect the Lockbox secret from deletion"
  type        = bool
  default     = true
}

variable "labels" {
  description = "Resource labels"
  type        = map(string)
  default     = {}
}
