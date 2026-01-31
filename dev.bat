@echo off
REM KPSY LAB Portal - 로컬 개발 서버 실행
REM 사용: dev.bat

cd /d "%~dp0"

echo [dev] Portal 로컬 개발 서버 시작
echo.

REM 환경 변수 확인 (선택적)
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo [dev] 경고: Supabase 환경 변수가 설정되지 않았습니다.
    echo [dev] .env.local 파일을 확인하거나 환경 변수를 설정해주세요.
    echo.
)

REM 의존성 설치 확인
if not exist "node_modules" (
    echo [dev] node_modules가 없습니다. npm install을 실행합니다...
    call npm install
    if errorlevel 1 (
        echo [dev] npm install 실패
        exit /b 1
    )
)

REM 개발 서버 시작
echo [dev] 개발 서버를 시작합니다...
echo [dev] 브라우저에서 http://localhost:7777 접속
echo [dev] 중지하려면 Ctrl+C
echo.

call npm run dev
