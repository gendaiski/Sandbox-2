@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 18 or newer, then open this launcher again.
  pause
  exit /b 1
)
cd /d "%~dp0"
if not exist "project-workspace" mkdir "project-workspace"
pushd "project-workspace"
node "..\source\bin\beforecode.js" start
popd
pause
