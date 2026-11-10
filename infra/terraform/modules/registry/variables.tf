variable "name" {
  description = "Name prefix"
  type        = string
}

variable "repositories" {
  description = "Image repositories to create"
  type        = list(string)
  default     = ["datashelf-api", "datashelf-etl", "datashelf-web"]
}

variable "retained_images" {
  description = "Tagged images to keep per repository"
  type        = number
  default     = 10
}

variable "labels" {
  description = "Resource labels"
  type        = map(string)
  default     = {}
}
