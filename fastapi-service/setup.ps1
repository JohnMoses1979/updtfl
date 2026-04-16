$ErrorActionPreference = "Stop"

$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    python -m venv (Join-Path $PSScriptRoot "venv")
}

& $venvPython -m pip install --upgrade pip

# Install a prebuilt dlib wheel on Windows so pip doesn't try to compile it.
& $venvPython -m pip install dlib-bin

# Install the rest of the service dependencies.
& $venvPython -m pip install -r (Join-Path $PSScriptRoot "requirements.txt")

# Install face_recognition without re-resolving dlib from source.
& $venvPython -m pip install face-recognition --no-deps

Write-Host ""
Write-Host "Setup complete."
Write-Host "Activate with: .\venv\Scripts\Activate.ps1"
Write-Host "Run with:      .\venv\Scripts\python.exe -m uvicorn main:app --reload"
