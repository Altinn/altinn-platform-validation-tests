variable "tenant_id" {
  type      = string
  sensitive = true
}

variable "subscription_id" {
  type      = string
  sensitive = true
}

variable "system_identity_object_id" {
  type      = string
  sensitive = true
}

variable "default_host_name" {
  type      = string
  sensitive = false
}
variable "at22_host_name" {
  type      = string
  sensitive = false
}
variable "at23_host_name" {
  type      = string
  sensitive = false
}
variable "tt02_host_name" {
  type      = string
  sensitive = false
}
