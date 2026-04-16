$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$pythonExe = Join-Path $projectRoot "venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    throw "Virtual environment not found at $pythonExe. Run .\setup.ps1 first."
}

Set-Location $projectRoot

& $pythonExe -m uvicorn main:app --reload --app-dir $projectRoot
