/**
 * 여러 블로그 포스트를 일괄 생성하는 스크립트
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const POSTS_DIR = path.join(process.cwd(), 'docs', 'blog_posts_phase1');
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'create-blog-post.ts');

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`❌ 디렉토리를 찾을 수 없습니다: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  console.log(`📝 ${files.length}개의 포스트를 생성합니다...\n`);

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    console.log(`처리 중: ${file}`);
    
    try {
      execSync(`npx tsx "${SCRIPT_PATH}" "${filePath}"`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      // 각 포스트 사이에 짧은 대기 시간
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ ${file} 처리 실패:`, error);
    }
  }

  console.log(`\n✅ 모든 포스트 생성 완료!`);
}

main().catch(console.error);
