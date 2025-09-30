# Install dependencies for the project
# Usage (PowerShell):
#   ./scripts/install-deps.ps1

param(
    [switch]$ForceInstall
)

Write-Host "== Install dependencies for 7k_wiki =="

# Check for node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "node not found in PATH. Please install Node.js (>=18) and try again."
    exit 1
}

# Prefer npm ci when package-lock.json exists
if (Test-Path package-lock.json -and -not $ForceInstall) {
    Write-Host "Found package-lock.json — running 'npm ci' for reproducible install..."
    npm ci
    if ($LASTEXITCODE -ne 0) { Write-Error "npm ci failed"; exit $LASTEXITCODE }
} else {
    Write-Host "Running 'npm install'..."
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit $LASTEXITCODE }
}

Write-Host "\nDone. To run the dev server:\n  npm run dev"
