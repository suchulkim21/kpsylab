/**
 * 임시 플레이스홀더 이미지 생성 스크립트
 * 실제 이미지가 없을 때 사용할 수 있는 간단한 플레이스홀더 이미지를 생성합니다.
 */

import * as fs from 'fs';
import * as path from 'path';

const BLOG_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

// SVG 플레이스홀더 생성
function createPlaceholderSVG(index: number): string {
  const width = 1200;
  const height = 630;
  const text = `Blog Post ${index}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#1a1a1a"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="#888888" text-anchor="middle" dominant-baseline="middle">
    Placeholder Image
  </text>
</svg>`;
}

// 메인 함수
function main() {
  // 이미지 디렉토리 생성
  if (!fs.existsSync(BLOG_IMAGE_DIR)) {
    fs.mkdirSync(BLOG_IMAGE_DIR, { recursive: true });
  }

  console.log('📝 플레이스홀더 이미지 생성 중...\n');

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 1; i <= 100; i++) {
    const fileName = `topic_${String(i).padStart(3, '0')}.svg`;
    const filePath = path.join(BLOG_IMAGE_DIR, fileName);

    // 이미 존재하면 건너뛰기
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  ${fileName} 이미 존재함`);
      skippedCount++;
      continue;
    }

    try {
      const svg = createPlaceholderSVG(i);
      fs.writeFileSync(filePath, svg, 'utf-8');
      console.log(`✅ ${fileName} 생성 완료`);
      createdCount++;
    } catch (error) {
      console.error(`❌ ${fileName} 생성 실패:`, error);
    }
  }

  console.log(`\n📊 생성 완료:`);
  console.log(`  ✅ 생성: ${createdCount}개`);
  console.log(`  ⏭️  건너뜀: ${skippedCount}개`);
  console.log(`  📁 저장 위치: ${BLOG_IMAGE_DIR}`);
  console.log(`\n⚠️  참고: SVG 플레이스홀더는 임시용입니다.`);
  console.log(`   실제 이미지로 교체하려면 JPG 파일로 덮어쓰세요.`);
}

main();
