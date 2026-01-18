# GitHub 업로드 스크립트
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "GitHub 업로드 시작" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] 원격 저장소 확인..." -ForegroundColor Yellow
git remote -v
Write-Host ""

Write-Host "[2/3] 현재 브랜치 확인..." -ForegroundColor Yellow
git branch
Write-Host ""

Write-Host "[3/3] GitHub에 푸시 중..." -ForegroundColor Yellow
$result = git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "✅ 업로드 성공!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "❌ 업로드 실패" -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "가능한 원인:" -ForegroundColor Yellow
    Write-Host "1. GitHub 저장소가 아직 생성되지 않았을 수 있습니다"
    Write-Host "2. GitHub 인증이 필요할 수 있습니다"
    Write-Host "3. 저장소 접근 권한이 없을 수 있습니다"
    Write-Host ""
}
