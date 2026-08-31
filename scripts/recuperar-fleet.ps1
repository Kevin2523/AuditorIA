# Script de recuperacion: Fleet + Orbit
# Ejecutar como administrador si Orbit pierde conexion con Fleet.

$ErrorActionPreference = "Stop"

function Invoke-FleetJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Body,
        [hashtable]$Headers = @{}
    )

    $headersJson = $Headers | ConvertTo-Json -Compress
    $headersB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($headersJson))
    $bodyB64 = ""
    if ($Body) {
        $bodyB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Body))
    }
    $nodeScript = @'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
(async () => {
  const headersText = Buffer.from(process.env.FLEET_HEADERS_B64 || 'e30=', 'base64').toString('utf8');
  const bodyText = process.env.FLEET_BODY_B64 ? Buffer.from(process.env.FLEET_BODY_B64, 'base64').toString('utf8') : '';
  const headers = JSON.parse(headersText || '{}');
  headers['content-type'] = headers['content-type'] || 'application/json';
  const options = { method: process.env.FLEET_METHOD || 'GET', headers };
  if (bodyText) options.body = bodyText;
  const response = await fetch(process.env.FLEET_URI, options);
  const text = await response.text();
  if (!response.ok) {
    console.error(text);
    process.exit(1);
  }
  process.stdout.write(text);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
'@

    $response = (& docker exec `
        -e "FLEET_URI=$Uri" `
        -e "FLEET_METHOD=$Method" `
        -e "FLEET_BODY_B64=$bodyB64" `
        -e "FLEET_HEADERS_B64=$headersB64" `
        -e "NODE_NO_WARNINGS=1" `
        auditoria-n8n node -e $nodeScript) -join "`n"
    if ($LASTEXITCODE -ne 0) {
        throw "curl.exe fallo con codigo $LASTEXITCODE para $Method $Uri"
    }

    if ($response) {
        return $response | ConvertFrom-Json
    }

    return $null
}

Write-Host "=== Recuperacion Fleet + Orbit ===" -ForegroundColor Cyan

# 1. Verificar que Fleet este corriendo
Write-Host "`n[1/4] Verificando Fleet..." -ForegroundColor Yellow
$fleetStatus = docker inspect --format='{{.State.Status}}' auditoria-fleet 2>$null
if ($fleetStatus -ne "running") {
    Write-Host "  Fleet no esta corriendo. Iniciando..." -ForegroundColor Red
    Set-Location "C:\Users\kjmg2\Documents\hermes\AuditorIA"
    docker compose --env-file .env.ai-stack -f docker-compose.ai-stack.yml up -d fleet
    Start-Sleep -Seconds 15
} else {
    Write-Host "  Fleet esta corriendo." -ForegroundColor Green
}

# 2. Verificar conexion Fleet
Write-Host "`n[2/4] Verificando conexion Fleet..." -ForegroundColor Yellow
try {
    & docker exec -e "NODE_NO_WARNINGS=1" auditoria-n8n node -e "process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'; fetch('https://fleet:1337/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" | Out-Null
    Write-Host "  Fleet responde: 200" -ForegroundColor Green
} catch {
    Write-Host "  Fleet no responde. Verificar logs: docker logs auditoria-fleet" -ForegroundColor Red
    exit 1
}

# 3. Verificar enrollment secret
Write-Host "`n[3/4] Verificando enrollment secret..." -ForegroundColor Yellow
$body = '{"email":"kjmg2325@gmail.com","password":"@Stayhumble521"}'
$loginResponse = Invoke-FleetJson -Uri "https://fleet:1337/api/v1/fleet/login" -Method "POST" -Body $body
$token = $loginResponse.token

$secrets = Invoke-FleetJson -Uri "https://fleet:1337/api/v1/fleet/spec/enroll_secret" -Headers @{"Authorization"="Bearer $token"}
$currentSecret = $secrets.spec.secrets[0].secret
$expectedSecret = "IPYdHxuSS+SdL2NncCOxrlYeD9mZ4BXk"

if ($currentSecret -ne $expectedSecret) {
    Write-Host "  Secret NO coincide. Actual: $currentSecret" -ForegroundColor Red
    Write-Host "  Esperado: $expectedSecret" -ForegroundColor Yellow
    Write-Host "  Rota el secret desde la UI de Fleet y regenera el MSI." -ForegroundColor Yellow
} else {
    Write-Host "  Secret OK: $currentSecret" -ForegroundColor Green
}

# 4. Verificar hosts
Write-Host "`n[4/4] Verificando hosts..." -ForegroundColor Yellow
$hosts = Invoke-FleetJson -Uri "https://fleet:1337/api/v1/fleet/hosts" -Headers @{"Authorization"="Bearer $token"}
foreach ($hostItem in $hosts.hosts) {
    $status = if ($hostItem.status -eq "online") { "Online" } else { "Offline" }
    $color = if ($hostItem.status -eq "online") { "Green" } else { "Red" }
    Write-Host "  $($hostItem.hostname): $status (ultima vez: $($hostItem.seen_time))" -ForegroundColor $color
}

Write-Host "`n=== Diagnostico completo ===" -ForegroundColor Cyan
Write-Host "Si Orbit sigue offline, revisar primero:"
Write-Host "  1. Servicio: Get-Service 'Fleet osquery'" -ForegroundColor Yellow
Write-Host "  2. Logs Fleet: docker logs --tail 200 auditoria-fleet" -ForegroundColor Yellow
Write-Host "  3. Logs Orbit: C:\Windows\System32\config\systemprofile\AppData\Local\FleetDM\Orbit\Logs" -ForegroundColor Yellow
