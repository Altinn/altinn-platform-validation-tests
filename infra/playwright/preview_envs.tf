

resource "azurerm_service_plan" "playwright_artifacts_preview_envs" {
  for_each            = var.preview_environments
  name                = "playwright-artifacts-service-plan-${each.key}"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location
  os_type             = "Linux"
  sku_name            = "FC1"
}

resource "azurerm_function_app_flex_consumption" "playwright_artifacts_preview_envs" {
  for_each            = var.preview_environments
  name                = "playwright-artifacts-function-app-${each.key}"
  resource_group_name = azurerm_resource_group.playwright.name
  location            = azurerm_resource_group.playwright.location
  service_plan_id     = azurerm_service_plan.playwright_artifacts_preview_envs[each.key].id

  storage_container_type = "blobContainer"

  // storage_container_endpoint  = "${azurerm_storage_account.playwright_artifacts_function_app_preview_envs.primary_blob_endpoint}${azurerm_storage_container.playwright_artifacts_function_app_preview_envs.name}"
  storage_container_endpoint = "${azurerm_storage_account.playwright_artifacts_function_app_preview_envs[each.key].primary_blob_endpoint}${azurerm_storage_container.playwright_artifacts_function_app_preview_envs[each.key].name}"

  storage_authentication_type = "StorageAccountConnectionString"
  storage_access_key          = azurerm_storage_account.playwright_artifacts_function_app_preview_envs[each.key].primary_access_key

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

  lifecycle {
    ignore_changes = [
      auth_settings_v2
    ]
  }

  /* Should I add this? In practice this config is done in the background by Azure, but I'd rather not have it opened a single second.
  auth_settings_v2 {
    auth_enabled           = true
    require_authentication = true
    unauthenticated_action = "Return401"

    active_directory_v2 {
      client_id            = var.function_app_client_id
      tenant_auth_endpoint = "https://login.microsoftonline.com/${var.tenant_id}/v2.0"
    }

    login {
      token_store_enabled = true
    }
  }
  */
}


resource "azurerm_storage_account" "playwright_artifacts_function_app_preview_envs" {
  for_each            = var.preview_environments
  name                = "funcapp6546${each.key}"
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

resource "azurerm_storage_container" "playwright_artifacts_function_app_preview_envs" {
  for_each              = var.preview_environments
  name                  = "funcapp6546-flexcontainer-${each.key}"
  storage_account_id    = azurerm_storage_account.playwright_artifacts_function_app_preview_envs[each.key].id
  container_access_type = "private"
}
