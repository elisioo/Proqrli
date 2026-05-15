$files = @(
    "Controllers\Procure\PurchaseOrdersController.cs",
    "Controllers\Procure\PurchaseRequisitionsController.cs",
    "Controllers\Procure\InvoicesController.cs",
    "Controllers\Procure\InventoryController.cs",
    "Controllers\Procure\VendorsController.cs"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        $c = $c -replace "public async Task<IActionResult> GetAll\(\)", "public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)"
        Set-Content -Path $f -Value $c
    }
}
