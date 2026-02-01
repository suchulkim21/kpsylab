# KPSY LAB - kpsylab.com 배포 스크립트
# 마인드 아키텍터 분석 결과 등 변경 사항을 kpsylab.com에 반영합니다.
#
# 사용: PowerShell에서 실행
#   cd C:\Projects\Pj-main
#   .\apps\portal\deploy-kpsylab.ps1

$ErrorActionPreference = "Stop"

# Git 루트 찾기 (apps/portal 기준 상위 2단계 = monorepo 루트)
$gitRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $gitRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KPSY LAB - kpsylab.com 배포" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".git")) {
    Write-Host "[오류] .git 폴더가 없습니다. Git 저장소가 아닙니다." -ForegroundColor Red
    Write-Host "       올바른 프로젝트 폴더에서 실행하세요: C:\Projects\Pj-main" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/4] 변경 파일 스테이징..." -ForegroundColor Yellow
git add apps/portal/lib/adapters/
git add apps/portal/lib/constants/
git add apps/portal/components/report/
git add apps/portal/types/
git add apps/portal/app/growth-roadmap/
git add apps/portal/app/globals.css
Write-Host "      완료" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] 전체 변경 사항 추가..." -ForegroundColor Yellow
git add .
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "      커밋할 변경 사항이 없습니다. 이미 최신 상태일 수 있습니다." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Vercel CLI로 직접 배포하려면:" -ForegroundColor Cyan
    Write-Host "  cd apps/portal" -ForegroundColor White
    Write-Host "  vercel --prod --yes" -ForegroundColor White
    exit 0
}
Write-Host "      완료" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] 커밋..." -ForegroundColor Yellow
git commit -m "feat: 마인드 아키텍터 분석 결과 개선 - UnifiedReportCard, 리포트 템플릿, 한글화, 모듈3 콘텐츠 수정"
if ($LASTEXITCODE -ne 0) {
    Write-Host "      커밋 실패 (이미 커밋되었을 수 있음)" -ForegroundColor Yellow
} else {
    Write-Host "      완료" -ForegroundColor Green
}
Write-Host ""

Write-Host "[4/4] 원격 저장소에 푸시..." -ForegroundColor Yellow
$branch = git branch --show-current
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  배포 트리거 완료" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vercel이 자동으로 빌드 및 배포를 시작합니다." -ForegroundColor White
    Write-Host "몇 분 후 https://www.kpsylab.com 에 반영됩니다." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[오류] Git 푸시 실패." -ForegroundColor Red
    Write-Host ""
    Write-Host "대안: Vercel CLI로 직접 배포" -ForegroundColor Cyan
    Write-Host "  cd C:\Projects\Pj-main\apps\portal" -ForegroundColor White
    Write-Host "  vercel --prod --yes" -ForegroundColor White
    Write-Host ""
    exit 1
}
