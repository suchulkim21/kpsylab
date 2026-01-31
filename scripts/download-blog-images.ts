/**
 * 저작권 없는 블로그 이미지 다운로드 스크립트
 * Unsplash Source API를 사용하여 이미지를 다운로드하고 로컬에 저장
 * 
 * 사용법:
 *   npx tsx scripts/download-blog-images.ts --count 120
 *   npx tsx scripts/download-blog-images.ts --topic "psychology" --index 1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const BLOG_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

// 이미지 디렉토리 생성
if (!fs.existsSync(BLOG_IMAGE_DIR)) {
  fs.mkdirSync(BLOG_IMAGE_DIR, { recursive: true });
}

// 심리학 관련 키워드 목록
const PSYCHOLOGY_KEYWORDS = [
  'psychology', 'mind', 'brain', 'meditation', 'wellness',
  'mental-health', 'therapy', 'counseling', 'self-care',
  'mindfulness', 'growth', 'development', 'success',
  'motivation', 'inspiration', 'peace', 'calm',
  'balance', 'harmony', 'nature', 'zen', 'yoga',
  'reflection', 'thinking', 'learning', 'books',
  'writing', 'journal', 'person', 'portrait',
  'landscape', 'abstract', 'minimal', 'modern'
];

// 이미지 다운로드 함수
function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 리다이렉트 처리
        return downloadImage(response.headers.location || url, filePath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

// Unsplash Source API로 이미지 URL 생성
function getUnsplashImageUrl(keyword: string, width: number = 1200, height: number = 630): string {
  // Unsplash Source API (API 키 불필요)
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

// Pexels API 사용 (API 키 필요하지만 더 안정적)
async function getPexelsImage(keyword: string, apiKey?: string): Promise<string | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`;
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large; // 1200x800 크기
    }
  } catch (error) {
    console.error('Pexels API 오류:', error);
  }

  return null;
}

// 이미지 다운로드 (여러 소스 시도)
async function downloadBlogImage(index: number, keyword?: string): Promise<boolean> {
  const fileName = `topic_${String(index).padStart(3, '0')}.jpg`;
  const filePath = path.join(BLOG_IMAGE_DIR, fileName);

  // 이미 존재하면 건너뛰기
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  ${fileName} 이미 존재함`);
    return true;
  }

  const searchKeyword = keyword || PSYCHOLOGY_KEYWORDS[index % PSYCHOLOGY_KEYWORDS.length];

  // 1. Pexels API 시도 (API 키가 있는 경우)
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (pexelsApiKey) {
    try {
      const pexelsUrl = await getPexelsImage(searchKeyword, pexelsApiKey);
      if (pexelsUrl) {
        await downloadImage(pexelsUrl, filePath);
        console.log(`✅ ${fileName} 다운로드 완료 (Pexels: ${searchKeyword})`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️  Pexels 다운로드 실패, Unsplash로 시도: ${error}`);
    }
  }

  // 2. Unsplash Source API 사용
  try {
    const unsplashUrl = getUnsplashImageUrl(searchKeyword);
    await downloadImage(unsplashUrl, filePath);
    console.log(`✅ ${fileName} 다운로드 완료 (Unsplash: ${searchKeyword})`);
    
    // 다운로드된 파일 크기 확인 (너무 작으면 실패로 간주)
    const stats = fs.statSync(filePath);
    if (stats.size < 10000) { // 10KB 미만이면 실패
      fs.unlinkSync(filePath);
      throw new Error('Downloaded file too small');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${fileName} 다운로드 실패:`, error);
    return false;
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  let count = 120;
  let topic: string | undefined;
  let index: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
    } else if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
    } else if (args[i] === '--index' && args[i + 1]) {
      index = parseInt(args[i + 1], 10);
    }
  }

  console.log('📥 블로그 이미지 다운로드 시작...\n');

  if (index !== undefined) {
    // 단일 이미지 다운로드
    await downloadBlogImage(index, topic);
  } else {
    // 여러 이미지 다운로드
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= count; i++) {
      const success = await downloadBlogImage(i, topic);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // API rate limit 방지를 위한 대기
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      }
    }

    console.log(`\n📊 다운로드 완료:`);
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${failCount}개`);
  }
}

main().catch(console.error);
