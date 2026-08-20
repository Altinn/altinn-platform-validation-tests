resource "azurerm_resource_group" "playwright" {
  name     = "playwright-rg"
  location = "West Europe"
}

resource "azurerm_key_vault" "playwright" {
  name                       = "playwright-keyvault-6546"
  location                   = azurerm_resource_group.playwright.location
  resource_group_name        = azurerm_resource_group.playwright.name
  tenant_id                  = var.tenant_id
  sku_name                   = "premium"
  soft_delete_retention_days = 7

  rbac_authorization_enabled = false # By default, but I should double check

  access_policy {
    tenant_id          = var.tenant_id
    object_id          = var.system_identity_object_id
    secret_permissions = ["Get"]
  }
  access_policy {
    tenant_id          = var.tenant_id
    object_id          = data.azurerm_client_config.current.object_id
    secret_permissions = ["Get", "Set", "List", "Delete", "Purge"]
  }
}

resource "azurerm_key_vault_secret" "azureclientsecret" {
  name         = "azure-client-secret"
  value        = azuread_application_password.playwrightreports.value
  key_vault_id = azurerm_key_vault.playwright.id
}

resource "azurerm_key_vault_secret" "azureclientid" {
  name         = "azure-client-id"
  value        = azuread_application.playwrightreports.client_id
  key_vault_id = azurerm_key_vault.playwright.id
}

resource "azurerm_storage_account" "playwright_reports" {
  name                = "playwrightartifacts6546"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location

  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version = "TLS1_2"

  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = false

    cors_rule {
      allowed_origins = [
        "https://${var.default_host_name}"
      ]

      allowed_methods = [
        "GET",
        "HEAD"
      ]

      allowed_headers = ["*"]
      exposed_headers = ["*"]

      max_age_in_seconds = 3600
    }
  }
}

resource "azurerm_storage_container" "playwright_artifacts" {
  name                  = "playwright-artifacts"
  storage_account_id    = azurerm_storage_account.playwright_reports.id
  container_access_type = "private"
}

resource "azurerm_storage_account" "playwright_artifacts_function_app" {
  name                = "funcapp6546"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location

  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version = "TLS1_2"

  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = false
  }
}

resource "azurerm_storage_container" "playwright_artifacts_function_app" {
  name                  = "funcapp6546-flexcontainer"
  storage_account_id    = azurerm_storage_account.playwright_artifacts_function_app.id
  container_access_type = "private"
}
