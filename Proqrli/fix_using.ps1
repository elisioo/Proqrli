$files = @(
    "Controllers\Procure\InvoicesController.cs",
    "Controllers\Procure\VendorsController.cs",
    "Controllers\Procure\PurchaseOrdersController.cs",
    "Controllers\Procure\RfqsController.cs",
    "Controllers\Procure\InventoryController.cs",
    "Controllers\Procure\PurchaseRequisitionsController.cs"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        if ($c -notmatch "using System.Security.Claims;") {
            $c = "using System.Security.Claims;
" + $c
            Set-Content -Path $f -Value $c
        }
    }
}
