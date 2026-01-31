/**
 * 관리자용 블로그 이미지 다운로드 API
 * 주제에 맞는 저작권 없는 이미지를 다운로드하여 로컬에 저장
 */

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export const dynamic = 'force-dynamic';

const BLOG_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

// 이미지 디렉토리 생성
function ensureImageDir() {
  if (!fs.existsSync(BLOG_IMAGE_DIR)) {
    fs.mkdirSync(BLOG_IMAGE_DIR, { recursive: true });
  }
}

// 키워드 변환
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

  const lowerKeyword = keyword.toLowerCase();
  for (const [ko, en] of Object.entries(translations)) {
    if (lowerKeyword.includes(ko)) {
      return en;
    }
  }

  return 'psychology';
}

// 이미지 다운로드
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

// Unsplash Source API
function getUnsplashImageUrl(keyword: string, width: number = 1200, height: number = 630): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

// Pexels API
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

export async function GET(request: Request) {
  try {
    // 관리자 인증
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get('index') || '1', 10);
    const topic = searchParams.get('topic') || 'psychology';

    ensureImageDir();

    const fileName = `topic_${String(index).padStart(3, '0')}.jpg`;
    const filePath = path.join(BLOG_IMAGE_DIR, fileName);

    // 이미 존재하면 확인
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 10000) {
        return NextResponse.json({
          success: true,
          message: 'Image already exists',
          path: `/images/blog/${fileName}`,
        });
      } else {
        fs.unlinkSync(filePath);
      }
    }

    const englishKeyword = translateKeyword(topic);

    // 1. Pexels API 시도
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (pexelsApiKey) {
      try {
        const pexelsUrl = await getPexelsImage(englishKeyword, pexelsApiKey);
        if (pexelsUrl) {
          await downloadImage(pexelsUrl, filePath);
          const stats = fs.statSync(filePath);
          if (stats.size > 10000) {
            return NextResponse.json({
              success: true,
              message: 'Image downloaded from Pexels',
              path: `/images/blog/${fileName}`,
              size: stats.size,
            });
          }
        }
      } catch (error) {
        console.warn('Pexels download failed, trying Unsplash');
      }
    }

    // 2. Unsplash Source API
    try {
      const unsplashUrl = getUnsplashImageUrl(englishKeyword);
      await downloadImage(unsplashUrl, filePath);
      const stats = fs.statSync(filePath);
      
      if (stats.size < 10000) {
        fs.unlinkSync(filePath);
        throw new Error('Downloaded file too small');
      }

      return NextResponse.json({
        success: true,
        message: 'Image downloaded from Unsplash',
        path: `/images/blog/${fileName}`,
        size: stats.size,
      });
    } catch (error: any) {
      console.error('Image download failed:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Image download failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in download-image API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
