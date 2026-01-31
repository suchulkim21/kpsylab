@echo off
REM KPSY LAB Portal - 터미널 전용 프로덕션 배포
REM 사용: deploy.bat

cd /d "%~dp0"
set HTTP_PROXY=
set HTTPS_PROXY=
set NO_PROXY=*
call vercel --prod --yes
if errorlevel 1 (echo [deploy] 실패. vercel login 후 재시도. & exit /b 1)
echo [deploy] 완료. https://www.kpsylab.com 반영됨.
