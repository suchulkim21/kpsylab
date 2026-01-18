/**
 * 이미지 파일 복사 스크립트
 * image 폴더의 이미지를 portal/public/images로 복사합니다.
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '..', 'image');
const targetDir = path.join(__dirname, '..', 'public', 'images');

// 이미지 파일 매핑
const imageMap = {
  '공감 능력의 결여.png': 'empathy-post-8.png',
  '그림자 통합.png': 'shadow-post-16.png'
};

// 대상 디렉토리 생성
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✅ 디렉토리 생성: ${targetDir}`);
}

// 이미지 파일 복사
let copiedCount = 0;
for (const [sourceName, targetName] of Object.entries(imageMap)) {
  const sourcePath = path.join(sourceDir, sourceName);
  const targetPath = path.join(targetDir, targetName);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 원본 파일을 찾을 수 없습니다: ${sourcePath}`);
    continue;
  }

  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ 복사 완료: ${sourceName} → ${targetName}`);
    copiedCount++;
  } catch (error) {
    console.error(`❌ 복사 실패: ${sourceName}`, error.message);
  }
}

console.log(`\n총 ${copiedCount}개 파일이 복사되었습니다.`);

// 복사된 파일 확인
console.log('\n=== 복사된 파일 목록 ===');
const files = fs.readdirSync(targetDir);
files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const stats = fs.statSync(filePath);
  console.log(`  ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
});

