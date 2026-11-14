$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw "The native build failed. Read the Docker build log above." }
Start-Process "http://localhost:4288"
