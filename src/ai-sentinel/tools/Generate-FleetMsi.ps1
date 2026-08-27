$ErrorActionPreference = "Stop"
$env:DEBUG = "false"

$root = Split-Path -Parent $PSScriptRoot
$fleetctl = Join-Path $root ".tools\fleetctl\fleetctl_v4.84.2_windows_amd64\fleetctl.exe"
$outDir = Join-Path $root "instaladores"
$outFile = Join-Path $outDir "fleet-osquery.msi"
$enrollSecret = $env:FLEET_ENROLL_SECRET
$cert = Join-Path $root "certs\fleet.crt"
$fleetUrl = if ($env:FLEET_ENROLL_URL) { $env:FLEET_ENROLL_URL } else { "https://fleet.local:1337" }

if (-not $enrollSecret) {
    throw "Set FLEET_ENROLL_SECRET before generating the Fleet MSI."
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

& $fleetctl package `
    --type msi `
    --fleet-url=$fleetUrl `
    --enroll-secret=$enrollSecret `
    --fleet-certificate $cert `
    --fleet-desktop `
    --outfile $outFile

Write-Host "Generated installer: $outFile"
