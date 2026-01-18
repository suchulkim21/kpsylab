# Git 원격 저장소 수정 및 푸시 스크립트
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "원격 저장소 수정 및 푸시" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 현재 원격 저장소 확인
Write-Host "[1/4] 현재 원격 저장소 확인..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# 기존 원격 저장소 제거 (있다면)
Write-Host "[2/4] 기존 원격 저장소 제거..." -ForegroundColor Yellow
$result = git remote remove origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "원격 저장소가 없거나 이미 제거됨" -ForegroundColor Gray
} else {
    Write-Host "✅ 완료" -ForegroundColor Green
}
Write-Host ""

# 올바른 원격 저장소 추가
Write-Host "[3/4] 올바른 원격 저장소 추가..." -ForegroundColor Yellow
git remote add origin https://github.com/suchulkim21/kpsylab-portal.git
Write-Host "✅ 완료" -ForegroundColor Green
Write-Host ""

# 원격 저장소 확인
Write-Host "원격 저장소 확인:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# 브랜치 확인 및 main으로 변경
Write-Host "[4/4] 브랜치 확인 및 푸시..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "현재 브랜치: $branch" -ForegroundColor Gray

if ($branch -eq "master") {
    Write-Host "master 브랜치를 main으로 변경 중..." -ForegroundColor Yellow
    git branch -M main
    Write-Host "✅ 완료" -ForegroundColor Green
}

Write-Host ""
Write-Host "GitHub에 푸시 중..." -ForegroundColor Yellow
$pushResult = git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "✅ 푸시 성공!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "저장소 확인: https://github.com/suchulkim21/kpsylab-portal" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "❌ 푸시 실패" -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "가능한 원인:" -ForegroundColor Yellow
    Write-Host "1. GitHub 인증 문제 (Personal Access Token 필요)"
    Write-Host "2. 저장소 접근 권한 문제"
    Write-Host "3. 네트워크 연결 문제"
    Write-Host ""
}
