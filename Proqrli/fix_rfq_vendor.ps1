$content = Get-Content Controllers\Procure\VendorsController.cs -Raw
$new_content = $content -replace "var buyerTenantId = await _db\.Tenants\s*\.Where\(t => t\.TenantType == "Buyer"\)\s*\.Select\(t => t\.TenantID\)\s*\.FirstOrDefaultAsync\(\);(?:\s*if \(buyerTenantId == 0\) buyerTenantId = 1;)?", "var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var buyerTenantId)) return Unauthorized();"
Set-Content -Path Controllers\Procure\VendorsController.cs -Value $new_content

$content = Get-Content Controllers\Procure\RfqsController.cs -Raw
$new_content = $content -replace "var buyerTenantId = await _db\.Tenants\s*\.Where\(t => t\.TenantType == "Buyer"\)\s*\.Select\(t => t\.TenantID\)\s*\.FirstOrDefaultAsync\(\);(?:\s*if \(buyerTenantId == 0\) buyerTenantId = 1;)?", "var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var buyerTenantId)) return Unauthorized();"
Set-Content -Path Controllers\Procure\RfqsController.cs -Value $new_content

$content = Get-Content Controllers\Procure\InventoryController.cs -Raw
$new_content = $content -replace "public async Task<IActionResult> GetAll\(\)\s*\{", "public async Task<IActionResult> GetAll()
        {
            var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();
"
$new_content = $new_content -replace "var query = from item in _db\.Items", "var query = from item in _db.Items.Where(i => i.TenantID == tenantId)"
Set-Content -Path Controllers\Procure\InventoryController.cs -Value $new_content
