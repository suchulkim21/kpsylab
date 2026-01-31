/**
 * 단일 블로그 이미지 다운로드 스크립트
 * 주제에 맞는 이미지를 다운로드
 * 
 * 사용법:
 *   npx tsx scripts/download-single-image.ts --topic "psychology" --index 1
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

// 이미지 다운로드 함수
function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location || url, filePath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
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

// 키워드를 한국어에서 영어로 변환
function translateKeyword(keyword: string): string {
  const translations: Record<string, string> = {
    '심리학': 'psychology',
    '무의식': 'unconscious',
    '습관': 'habit',
    '변화': 'change',
    '성장': 'growth',
    '자기계발': 'self-development',
    '관계': 'relationship',
    '감정': 'emotion',
    '스트레스': 'stress',
    '명상': 'meditation',
    '마음챙김': 'mindfulness',
    '번아웃': 'burnout',
    '자존감': 'self-esteem',
    '목표': 'goal',
    '성공': 'success',
    '동기부여': 'motivation',
    '리더십': 'leadership',
    '커뮤니케이션': 'communication',
    '직장': 'workplace',
    '워라밸': 'work-life-balance',
  };

  // 키워드에서 관련 단어 추출
  const lowerKeyword = keyword.toLowerCase();
  for (const [ko, en] of Object.entries(translations)) {
    if (lowerKeyword.includes(ko)) {
      return en;
    }
  }

  // 기본값
  return 'psychology';
}

// Unsplash Source API로 이미지 URL 생성
function getUnsplashImageUrl(keyword: string, width: number = 1200, height: number = 630): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

// Pexels API 사용
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
      return data.photos[0].src.large;
    }
  } catch (error) {
    console.error('Pexels API 오류:', error);
  }

  return null;
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  let topic: string = 'psychology';
  let index: number = 1;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
    } else if (args[i] === '--index' && args[i + 1]) {
      index = parseInt(args[i + 1], 10);
    }
  }

  const fileName = `topic_${String(index).padStart(3, '0')}.jpg`;
  const filePath = path.join(BLOG_IMAGE_DIR, fileName);

  // 이미 존재하면 확인
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 10000) {
      console.log(`✅ ${fileName} 이미 존재함 (${(stats.size / 1024).toFixed(1)}KB)`);
      return;
    } else {
      console.log(`⚠️  ${fileName} 파일이 손상됨. 다시 다운로드합니다.`);
      fs.unlinkSync(filePath);
    }
  }

  const englishKeyword = translateKeyword(topic);
  console.log(`📥 이미지 다운로드 중: ${fileName} (키워드: ${englishKeyword})`);

  // 1. Pexels API 시도
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (pexelsApiKey) {
    try {
      const pexelsUrl = await getPexelsImage(englishKeyword, pexelsApiKey);
      if (pexelsUrl) {
        await downloadImage(pexelsUrl, filePath);
        const stats = fs.statSync(filePath);
        console.log(`✅ ${fileName} 다운로드 완료 (Pexels, ${(stats.size / 1024).toFixed(1)}KB)`);
        return;
      }
    } catch (error) {
      console.warn(`⚠️  Pexels 다운로드 실패, Unsplash로 시도`);
    }
  }

  // 2. Unsplash Source API 사용
  try {
    const unsplashUrl = getUnsplashImageUrl(englishKeyword);
    await downloadImage(unsplashUrl, filePath);
    const stats = fs.statSync(filePath);
    if (stats.size < 10000) {
      fs.unlinkSync(filePath);
      throw new Error('Downloaded file too small');
    }
    console.log(`✅ ${fileName} 다운로드 완료 (Unsplash, ${(stats.size / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error(`❌ ${fileName} 다운로드 실패:`, error);
    process.exit(1);
  }
}

main().catch(console.error);
