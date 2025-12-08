# Build all three cards
$env:BUILD_CARD = 'energy-flow-card'
vite build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:BUILD_CARD = 'compact-home-energy-flow-card'
vite build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:BUILD_CARD = 'metered-home-energy-flow-card'
vite build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
