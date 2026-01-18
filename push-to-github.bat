@echo off
cd /d "%~dp0"
echo ====================================
echo GitHub 업로드 시작
echo ====================================
echo.

echo [1/3] 원격 저장소 확인...
git remote -v
echo.

echo [2/3] 현재 브랜치 확인...
git branch
echo.

echo [3/3] GitHub에 푸시 중...
git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo ✅ 업로드 성공!
    echo ====================================
) else (
    echo.
    echo ====================================
    echo ❌ 업로드 실패
    echo ====================================
    echo.
    echo 가능한 원인:
    echo 1. GitHub 저장소가 아직 생성되지 않았을 수 있습니다
    echo 2. GitHub 인증이 필요할 수 있습니다
    echo 3. 저장소 접근 권한이 없을 수 있습니다
    echo.
    pause
)
