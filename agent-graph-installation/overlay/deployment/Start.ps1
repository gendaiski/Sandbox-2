$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.env')) {
  docker run --rm -v "${PSScriptRoot}:/setup" python:3.12-alpine python /setup/setup.py
  if ($LASTEXITCODE -ne 0) { throw 'Configuration failed' }
}
docker compose -f compose.yml up --build -d
if ($LASTEXITCODE -ne 0) { throw 'Startup failed; inspect Docker logs' }
Write-Host 'Open http://localhost:20050. Read ADMIN_PASSWORD in deployment/.env.'
