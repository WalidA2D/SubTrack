$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mobileEnvExample = Join-Path $root "apps/mobile/.env.example"
$mobileEnv = Join-Path $root "apps/mobile/.env"
$functionsEnvExample = Join-Path $root "functions/.env.example"
$functionsEnv = Join-Path $root "functions/.env"

function Copy-IfMissing {
  param(
    [string]$Source,
    [string]$Destination
  )

  if (-not (Test-Path $Destination)) {
    Copy-Item $Source $Destination
    Write-Host "Created $Destination from example file."
    return
  }

  Write-Host "$Destination already exists."
}

Write-Host "Preparing local Subly environment..."
Copy-IfMissing -Source $mobileEnvExample -Destination $mobileEnv
Copy-IfMissing -Source $functionsEnvExample -Destination $functionsEnv

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Put google-services.json in apps/mobile"
Write-Host "2. Put GoogleService-Info.plist in apps/mobile"
Write-Host "3. Fill functions/.env with FIREBASE_WEB_API_KEY"
Write-Host "4. Run npm install"
Write-Host "5. Run npm run functions:serve"
Write-Host "6. Run npm run android"
