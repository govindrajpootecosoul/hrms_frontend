# Fixes Next.js dev lock Access denied / stale lock (mixed admin vs normal runs, crashed dev).
$ErrorActionPreference = "Continue"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$nextDir = Join-Path $root ".next"
$lockPath = Join-Path $nextDir "dev\lock"
$who = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

Write-Host "Project: $root"

$conns = Get-NetTCPConnection -LocalPort 3005 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
  try {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process $($c.OwningProcess) on port 3005."
  } catch {}
}
Start-Sleep -Seconds 1

if (-not (Test-Path $nextDir)) {
  Write-Host ".next not found - nothing to fix. Run npm run dev"
  exit 0
}

Write-Host "Granting Full Control on .next to $who ..."
& icacls.exe $nextDir /grant "${who}:(OI)(CI)F" /T /C | Out-Null

if (Test-Path $lockPath) {
  try {
    attrib.exe -R -S -H $lockPath 2>$null | Out-Null
    Remove-Item -LiteralPath $lockPath -Force
    Write-Host "Removed lock file."
  } catch {
    Write-Host "Lock still blocked. Run this terminal as Administrator once:"
    Write-Host ('  takeown /f "' + $lockPath + '"')
    Write-Host ('  icacls "' + $lockPath + '" /grant "' + $who + ':F"')
    Write-Host ('  del "' + $lockPath + '"')
    exit 1
  }
}

Write-Host 'Done. Run: npm run dev'
