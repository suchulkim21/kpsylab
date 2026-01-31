# 로컬 개발 서버 실행 가이드

## 🚀 빠른 시작

### 방법 1: PowerShell 스크립트 (권장)
```powershell
cd C:\Projects\Pj-main\apps\portal
.\dev.ps1
```

### 방법 2: 배치 파일
```cmd
cd C:\Projects\Pj-main\apps\portal
dev.bat
```

### 방법 3: 직접 실행
```powershell
cd C:\Projects\Pj-main\apps\portal
npm install  # 처음 한 번만
npm run dev
```

---

## 📋 사전 준비

### 1. Node.js 설치 확인
```powershell
node --version  # v18 이상 권장
npm --version
```

### 2. 환경 변수 설정

**`.env.local` 파일 생성** (프로젝트 루트에):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 💡 **Supabase 키 찾는 방법:**
> 1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
> 2. 프로젝트 선택 → **Settings** → **API**
> 3. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 복사
> 4. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사

---

## 🌐 접속 주소

개발 서버가 시작되면:
- **메인 페이지**: http://localhost:7777
- **MNPS 테스트**: http://localhost:7777/mnps/test
- **결과 페이지**: http://localhost:7777/mnps/result

---

## ⚠️ 문제 해결

### 포트 7777이 이미 사용 중
```powershell
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :7777

# 다른 포트 사용하려면 package.json 수정:
# "dev": "next dev -p 3000"
```

### Supabase 연결 오류
- `.env.local` 파일이 올바른 위치에 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- Supabase 프로젝트가 활성화되어 있는지 확인

### 의존성 설치 오류
```powershell
# node_modules 삭제 후 재설치
Remove-Item -Recurse -Force node_modules
npm install
```

### 빌드 오류
```powershell
# .next 캐시 삭제 후 재시작
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 📝 개발 팁

### 핫 리로드
- 파일 저장 시 자동으로 브라우저가 새로고침됩니다
- React 컴포넌트는 Fast Refresh로 상태 유지

### 콘솔 로그
- 브라우저 개발자 도구 (F12) → Console 탭
- 서버 로그는 터미널에서 확인

### Supabase 실시간 확인
- Supabase Dashboard → **Table Editor**에서 데이터 확인
- **Logs** 탭에서 API 호출 확인

---

## 🛑 서버 중지

터미널에서 `Ctrl + C` 누르기

---

## 📚 관련 문서

- [Dark Nature Test 설정 가이드](./docs/DARK_NATURE_SETUP.md)
- [배포 가이드](./DEPLOY_터미널.md)
