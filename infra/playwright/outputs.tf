output "default_host_name" {
  value = azurerm_static_web_app.playwrightreports.default_host_name
}
output "system_identity_object_id" {
  value = azurerm_static_web_app.playwrightreports.identity[0].principal_id
}
output "container_url" {
  value = "${azurerm_storage_account.playwright_reports.primary_blob_endpoint}${azurerm_storage_container.playwright_artifacts.name}"
}
