$content = Get-Content Controllers\Procure\InvoicesController.cs -Raw
$new_content = $content -replace "x \=> x\.BuyerTenantID == tenantId \|\| x\.VendorTenantID == tenantId", "x => x.TenantID == tenantId || x.VendorTenantID == tenantId"
Set-Content -Path Controllers\Procure\InvoicesController.cs -Value $new_content
