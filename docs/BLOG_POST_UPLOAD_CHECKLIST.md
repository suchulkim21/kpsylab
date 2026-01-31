# 블로그 포스트 업로드 체크리스트

## ✅ 업로드 전 확인 사항

### 1. 환경 변수 확인
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨

### 2. 데이터베이스 스키마 확인
- [ ] `blog_posts` 테이블이 존재함
- [ ] RLS 정책이 올바르게 설정됨 (읽기/쓰기 권한)

### 3. 콘텐츠 확인
- [x] 100개 포스트 마크다운 파일 생성 완료
- [x] 기계적 작성도 개선 완료 (3.0/10)
- [x] 모든 반복 패턴 제거 완료
- [ ] 이미지 파일 다운로드 (선택 사항)

### 4. 이미지 파일 상태
- 현재 상태: `public/images/blog/` 폴더가 비어있음
- 이미지 경로: `/images/blog/topic_001.jpg` ~ `/images/blog/topic_100.jpg`
- **옵션 1**: 이미지 없이 업로드 (이미지 경로는 저장되지만 실제 파일은 없음)
- **옵션 2**: 이미지 다운로드 후 업로드

## 📤 업로드 방법

### 방법 1: 스크립트 실행 (권장)

```bash
cd C:\Projects\Pj-main\apps\portal
npx tsx scripts/upload-blog-posts.ts
```

### 방법 2: package.json 스크립트 추가 후 실행

`package.json`에 다음 스크립트 추가:
```json
"upload:blog": "tsx scripts/upload-blog-posts.ts"
```

그 다음 실행:
```bash
npm run upload:blog
```

## ⚠️ 주의 사항

1. **중복 체크**: 스크립트는 제목으로 중복을 확인합니다. 이미 존재하는 포스트는 건너뜁니다.
2. **API 레이트 리밋**: 각 업로드 사이에 100ms 딜레이를 두어 API 레이트 리밋을 방지합니다.
3. **이미지 파일**: 이미지 파일이 없어도 업로드는 가능합니다. 나중에 이미지를 추가할 수 있습니다.

## 📋 업로드 후 확인 사항

1. [ ] 홈페이지에서 블로그 포스트가 표시되는지 확인
2. [ ] 개별 포스트 페이지가 정상적으로 로드되는지 확인
3. [ ] 이미지가 표시되는지 확인 (이미지 다운로드 후)
4. [ ] SEO 메타데이터가 올바르게 설정되었는지 확인

## 🖼️ 이미지 다운로드 (선택 사항)

이미지를 다운로드하려면:

```bash
npm run download:images
```

또는

```bash
npx tsx scripts/download-blog-images.ts --count 100
```

---

**준비 완료**: 모든 체크리스트를 확인한 후 업로드를 진행하세요.
