$files = @(
    "Controllers\Procure\ComplianceController.cs",
    "Controllers\Procure\ContractsController.cs",
    "Controllers\Procure\InventoryController.cs",
    "Controllers\Procure\PurchaseOrdersController.cs",
    "Controllers\Procure\PurchaseRequisitionsController.cs"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        
        # Replace the hardcoded tenantId retrieval
        # Target variations:
        # var tenantId = await _db.Tenants.Select(t => t.TenantID).FirstOrDefaultAsync();
        # var tenantId = await _db.Tenants.Where(t => t.TenantType == "Buyer").Select(t => t.TenantID).FirstOrDefaultAsync();
        # Followed optionally by: if (tenantId == 0) tenantId = 1;
        
        $pattern = 'var tenantId = await _db\.Tenants(?:(?:\.Where\(t => t\.TenantType == "Buyer"\))?\.Select\(t => t\.TenantID\)\.FirstOrDefaultAsync\(\);|(?:\.FirstOrDefaultAsync\(\))?;)?(?:(?:\r?\n|\s)*if \(tenantId == 0\) tenantId = \d+;)?'
        $replacement = 'var tenantIdStr = User.FindFirstValue("tenant_id");
            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();'
        
        $c = $c -replace $pattern, $replacement
        Set-Content -Path $f -Value $c
    }
}
