# KPSY LAB Portal - 로컬 개발 서버 실행
# 사용: .\dev.ps1  또는  pwsh -File dev.ps1

$ErrorActionPreference = "Stop"
$portalRoot = $PSScriptRoot

Write-Host "[dev] Portal 로컬 개발 서버 시작 - $portalRoot" -ForegroundColor Cyan

# 환경 변수 확인
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "[dev] 경고: Supabase 환경 변수가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host "[dev] .env.local 파일을 확인하거나 환경 변수를 설정해주세요." -ForegroundColor Yellow
    Write-Host "[dev]   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "[dev]   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[dev] 계속 진행합니다 (DB 기능은 동작하지 않을 수 있습니다)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

Set-Location $portalRoot

# 의존성 설치 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "[dev] node_modules가 없습니다. npm install을 실행합니다..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[dev] npm install 실패" -ForegroundColor Red
        exit 1
    }
}

# 개발 서버 시작
Write-Host "[dev] 개발 서버를 시작합니다..." -ForegroundColor Green
Write-Host "[dev] 브라우저에서 http://localhost:7777 접속" -ForegroundColor Cyan
Write-Host "[dev] 중지하려면 Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm run dev
