# 터미널 전용 배포

**앞으로 모든 배포는 터미널에서만 수행합니다.**

---

## 1. 배포 방법

### PowerShell
```powershell
cd c:\Projects\Pj-main\apps\portal
.\deploy.ps1
```

### 또는 한 줄 (PowerShell)
```powershell
cd c:\Projects\Pj-main\apps\portal; $env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; vercel --prod --yes
```

### CMD
```cmd
cd c:\Projects\Pj-main\apps\portal
deploy.bat
```

### 필수
- `vercel login` 한 번 실행해 두어야 함.
- `apps\portal` 디렉터리에서 실행.

---

## 2. 배포 후 확인

- **www.kpsylab.com** ← 프로덕션 (Aliased)
- **kpsylab.com** (www 없음): Vercel 대시보드 → 프로젝트 kpsylab → Settings → Domains 에 `kpsylab.com`이 있어야 동일하게 적용됨. 없으면 추가.

---

## 3. 오래된 화면이 보일 때

1. **캐시**  
   - 시크릿/프라이빗 창에서 열기, 또는  
   - `Ctrl+Shift+R`(강력 새로고침)

2. **도메인**  
   - `https://www.kpsylab.com` 으로 접속해 보고, `https://kpsylab.com` 과 동작이 다르면 도메인 설정 확인.

3. **블로그 날짜·404**  
   - 블로그 날짜(예: 2025-01-15) = Supabase `blog_posts` 데이터.  
   - `/blog/113` 404 = id 113인 글이 DB에 없음. DB에 있는 id로만 접근 가능.

---

## 4. 문제 시

- `vercel --prod --yes` 가 `ECONNREFUSED` 나 연결 오류:  
  `HTTP_PROXY`, `HTTPS_PROXY` 제거 후 재시도. (deploy.ps1/deploy.bat에 반영됨)
- `vercel login` 안 했으면:  
  터미널에서 `vercel login` 실행 후 다시 배포.
