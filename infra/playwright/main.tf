resource "azurerm_resource_group" "playwright" {
  name     = "playwright-rg"
  location = "West Europe"
}

resource "azuread_application" "playwrightreports" {
  display_name = "playwrightreports-app"
  web {
    redirect_uris = ["https://${var.default_host_name}/.auth/login/aad/callback"]

    implicit_grant {
      access_token_issuance_enabled = false
      id_token_issuance_enabled     = true
    }
  }
  sign_in_audience = "AzureADMyOrg"
}

resource "azuread_service_principal" "playwrightreports" {
  client_id = azuread_application.playwrightreports.client_id
}

resource "azuread_application_password" "playwrightreports" {
  application_id = azuread_application.playwrightreports.id
  rotate_when_changed = {
    rotation = time_rotating.rotation.id
  }
}

resource "time_rotating" "rotation" {
  rotation_days = 365
}

resource "azurerm_key_vault" "playwright" {
  name                       = "playwright-keyvault-6546"
  location                   = azurerm_resource_group.playwright.location
  resource_group_name        = azurerm_resource_group.playwright.name
  tenant_id                  = var.tenant_id
  sku_name                   = "premium"
  soft_delete_retention_days = 7

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

resource "azurerm_static_web_app" "playwrightreports" {
  name                = "playwright-reports-webapp"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location
  sku_tier            = "Standard"
  sku_size            = "Standard"

  app_settings = {
    "AZURE_CLIENT_ID"     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.playwright.vault_uri}secrets/${azurerm_key_vault_secret.azureclientid.name}/)"
    "AZURE_CLIENT_SECRET" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.playwright.vault_uri}secrets/${azurerm_key_vault_secret.azureclientsecret.name}/)"
  }

  identity {
    type = "SystemAssigned"
  }

  preview_environments_enabled = false
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

resource "azurerm_storage_container" "playwright_artifacts" {
  name                  = "playwright-artifacts"
  storage_account_id    = azurerm_storage_account.playwright_reports.id
  container_access_type = "private"
}

resource "azurerm_storage_container" "playwright_artifacts_function_app" {
  name                  = "funcapp6546-flexcontainer"
  storage_account_id    = azurerm_storage_account.playwright_artifacts_function_app.id
  container_access_type = "private"
}

resource "azurerm_service_plan" "playwright_artifacts" {
  name                = "playwright-artifacts-service-plan"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location
  os_type             = "Linux"
  sku_name            = "FC1"
}

resource "azurerm_function_app_flex_consumption" "playwright_artifacts" {
  name                = "playwright-artifacts-function-app"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location
  service_plan_id     = azurerm_service_plan.playwright_artifacts.id


  storage_container_type = "blobContainer"

  storage_container_endpoint  = "${azurerm_storage_account.playwright_artifacts_function_app.primary_blob_endpoint}${azurerm_storage_container.playwright_artifacts_function_app.name}"
  storage_authentication_type = "StorageAccountConnectionString"
  storage_access_key          = azurerm_storage_account.playwright_artifacts_function_app.primary_access_key

  runtime_name           = "custom"
  runtime_version        = "1.0"
  maximum_instance_count = 5
  instance_memory_in_mb  = 2048

  site_config {
    http2_enabled = false
  }

  app_settings = {
    AZURE_STORAGE_ACCOUNT   = azurerm_storage_account.playwright_reports.name
    AZURE_STORAGE_KEY       = azurerm_storage_account.playwright_reports.primary_access_key
    AZURE_STORAGE_CONTAINER = azurerm_storage_container.playwright_artifacts.name
  }
  /*
  identity {
    type = "SystemAssigned"
  }
  */
}
/*
resource "azurerm_role_assignment" "blob_access" {
  scope                = azurerm_storage_account.playwright_reports.id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = azurerm_function_app_flex_consumption.playwright_artifacts.identity[0].principal_id
}
*/

resource "azurerm_static_web_app_function_app_registration" "example" {
  static_web_app_id = azurerm_static_web_app.playwrightreports.id
  function_app_id   = azurerm_function_app_flex_consumption.playwright_artifacts.id
}
