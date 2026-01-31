# KPSY LAB Portal - 터미널 전용 프로덕션 배포
# 사용: .\deploy.ps1  또는  pwsh -File deploy.ps1

$ErrorActionPreference = "Stop"
$portalRoot = $PSScriptRoot

Write-Host "[deploy] Portal 프로덕션 배포 (Vercel) - $portalRoot" -ForegroundColor Cyan

# 프록시 제거 (로컬 회사망 등에서 Vercel 연결 실패 방지)
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''
$env:NO_PROXY = '*'

Set-Location $portalRoot
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "[deploy] 완료. https://www.kpsylab.com 에 반영됩니다." -ForegroundColor Green
} else {
    Write-Host "[deploy] 배포 실패. vercel login 후 재시도." -ForegroundColor Red
    exit 1
}
