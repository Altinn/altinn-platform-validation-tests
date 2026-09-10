terraform {
  backend "azurerm" {
    resource_group_name  = "altinn-platform-validation-tests"
    storage_account_name = "terraformstate5511"
    container_name       = "tfstate"
    key                  = "infra.playwright.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  subscription_id = var.subscription_id
  features {}
  storage_use_azuread = true
}
