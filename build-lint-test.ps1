param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('charted','compact','metered')]
    [string]$Target
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot
try {
    $buildScript = "build:$Target"

    Write-Host "Building $Target…"
    pnpm run $buildScript
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "Linting $Target…"
    pnpm exec eslint $Target --ext .ts
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "Testing $Target…"
    pnpm exec vitest run "$Target"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host 'Done.'
}
finally {
    Pop-Location
}
