# Git 원격 저장소 수정 스크립트
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "원격 저장소 수정 중..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 현재 원격 저장소 확인
Write-Host "[1/3] 현재 원격 저장소 확인..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# 기존 원격 저장소 제거
Write-Host "[2/3] 기존 원격 저장소 제거..." -ForegroundColor Yellow
git remote remove origin
Write-Host "✅ 완료" -ForegroundColor Green
Write-Host ""

# 올바른 원격 저장소 추가
Write-Host "[3/3] 올바른 원격 저장소 추가..." -ForegroundColor Yellow
git remote add origin https://github.com/suchulkim21/kpsylab-portal.git
Write-Host "✅ 완료" -ForegroundColor Green
Write-Host ""

# 확인
Write-Host "원격 저장소 확인:" -ForegroundColor Cyan
git remote -v
Write-Host ""

Write-Host "====================================" -ForegroundColor Green
Write-Host "이제 다음 명령어로 푸시하세요:" -ForegroundColor Green
Write-Host "git push -u origin main" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Green
