$files = @(
    "Controllers\Procure\ComplianceController.cs",
    "Controllers\Procure\ContractsController.cs"
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
