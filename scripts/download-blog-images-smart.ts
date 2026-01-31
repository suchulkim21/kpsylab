/**
 * 블로그 포스트 주제에 맞는 저작권 없는 이미지 다운로드 스크립트
 * 각 포스트의 주제를 분석하여 적합한 키워드로 이미지를 검색하고 다운로드
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const BLOG_IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'blog');
const POSTS_DIR = path.join(process.cwd(), 'docs', 'blog_posts_phase1');

// 이미지 디렉토리 생성
if (!fs.existsSync(BLOG_IMAGE_DIR)) {
  fs.mkdirSync(BLOG_IMAGE_DIR, { recursive: true });
}

// 포스트 주제별 이미지 키워드 매핑
function getImageKeyword(title: string): string {
  const lowerTitle = title.toLowerCase();

  // 자아 인식, 무의식 관련
  if (lowerTitle.includes('무의식') || lowerTitle.includes('실수 반복') || lowerTitle.includes('선택') || lowerTitle.includes('충동')) {
    return 'mind consciousness psychology';
  }
  if (lowerTitle.includes('메타인지') || lowerTitle.includes('나를 안다') || lowerTitle.includes('관찰')) {
    return 'self-reflection meditation mindfulness';
  }
  if (lowerTitle.includes('자존감') || lowerTitle.includes('자존심') || lowerTitle.includes('완벽주의')) {
    return 'self-esteem confidence personal growth';
  }
  if (lowerTitle.includes('미루는') || lowerTitle.includes('결정 장애') || lowerTitle.includes('습관')) {
    return 'procrastination productivity habits';
  }
  if (lowerTitle.includes('번아웃') || lowerTitle.includes('내향') || lowerTitle.includes('외향') || lowerTitle.includes('민감')) {
    return 'burnout work-life balance personality';
  }
  if (lowerTitle.includes('방어 기제') || lowerTitle.includes('트라우마') || lowerTitle.includes('변화')) {
    return 'mental health therapy healing';
  }

  // 전략적 방향 전환
  if (lowerTitle.includes('피벗') || lowerTitle.includes('방향') || lowerTitle.includes('전환')) {
    return 'pivot change direction strategy';
  }
  if (lowerTitle.includes('위기') || lowerTitle.includes('기회') || lowerTitle.includes('리프레이밍')) {
    return 'opportunity crisis transformation';
  }
  if (lowerTitle.includes('목표') || lowerTitle.includes('터닝포인트') || lowerTitle.includes('가치관')) {
    return 'goal setting success achievement';
  }
  if (lowerTitle.includes('환경') || lowerTitle.includes('시스템') || lowerTitle.includes('루틴')) {
    return 'routine system organization workspace';
  }
  if (lowerTitle.includes('작은 성공') || lowerTitle.includes('스몰 윈') || lowerTitle.includes('회복 탄력성')) {
    return 'small wins progress resilience';
  }
  if (lowerTitle.includes('불안') || lowerTitle.includes('에너지')) {
    return 'anxiety energy motivation';
  }

  // 관계 관련
  if (lowerTitle.includes('관계') || lowerTitle.includes('거리두기') || lowerTitle.includes('끌리는')) {
    return 'relationship connection people';
  }
  if (lowerTitle.includes('거절') || lowerTitle.includes('착한 사람') || lowerTitle.includes('가스라이팅')) {
    return 'boundaries self-care assertiveness';
  }
  if (lowerTitle.includes('갈등') || lowerTitle.includes('나르시시스트') || lowerTitle.includes('뱀파이어')) {
    return 'conflict resolution communication';
  }
  if (lowerTitle.includes('신뢰') || lowerTitle.includes('리더십') || lowerTitle.includes('경계선')) {
    return 'trust leadership teamwork';
  }
  if (lowerTitle.includes('독성') || lowerTitle.includes('정리') || lowerTitle.includes('인연')) {
    return 'toxic relationship healing';
  }

  // 잠재력 관련
  if (lowerTitle.includes('이상향') || lowerTitle.includes('잠재력') || lowerTitle.includes('트리거')) {
    return 'potential growth development';
  }
  if (lowerTitle.includes('꿈') || lowerTitle.includes('현실') || lowerTitle.includes('재능')) {
    return 'dreams reality talent skills';
  }
  if (lowerTitle.includes('몰입') || lowerTitle.includes('flow') || lowerTitle.includes('한계')) {
    return 'flow state focus concentration';
  }
  if (lowerTitle.includes('비교') || lowerTitle.includes('속도') || lowerTitle.includes('열등감')) {
    return 'comparison self-acceptance pace';
  }
  if (lowerTitle.includes('성공') || lowerTitle.includes('그릿') || lowerTitle.includes('효능감')) {
    return 'success achievement motivation';
  }
  if (lowerTitle.includes('낙관주의') || lowerTitle.includes('감사') || lowerTitle.includes('주체성')) {
    return 'gratitude optimism empowerment';
  }

  // 실용 심리학
  if (lowerTitle.includes('스마트폰') || lowerTitle.includes('중독') || lowerTitle.includes('도파민')) {
    return 'digital detox technology balance';
  }
  if (lowerTitle.includes('정보 과부하') || lowerTitle.includes('뇌') || lowerTitle.includes('수면')) {
    return 'brain sleep rest wellness';
  }
  if (lowerTitle.includes('운동') || lowerTitle.includes('식습관') || lowerTitle.includes('공간')) {
    return 'exercise nutrition environment';
  }
  if (lowerTitle.includes('SNS') || lowerTitle.includes('우울증') || lowerTitle.includes('멀티태스킹')) {
    return 'social media mental health focus';
  }
  if (lowerTitle.includes('명상') || lowerTitle.includes('마음챙김') || lowerTitle.includes('디지털 디톡스')) {
    return 'meditation mindfulness peace';
  }
  if (lowerTitle.includes('스트레스') || lowerTitle.includes('감정 식별') || lowerTitle.includes('호흡')) {
    return 'stress management breathing calm';
  }
  if (lowerTitle.includes('리듬') || lowerTitle.includes('일상')) {
    return 'daily routine rhythm balance';
  }

  // 직장 심리
  if (lowerTitle.includes('직장') || lowerTitle.includes('권력') || lowerTitle.includes('업무')) {
    return 'workplace office business';
  }
  if (lowerTitle.includes('갈등 해결') || lowerTitle.includes('리더십') || lowerTitle.includes('피드백')) {
    return 'leadership communication feedback';
  }
  if (lowerTitle.includes('효율성') || lowerTitle.includes('생산성') || lowerTitle.includes('동기')) {
    return 'productivity efficiency motivation';
  }
  if (lowerTitle.includes('워라밸') || lowerTitle.includes('소통') || lowerTitle.includes('정체성')) {
    return 'work-life balance communication identity';
  }
  if (lowerTitle.includes('승진') || lowerTitle.includes('변화 적응')) {
    return 'career growth adaptation';
  }

  // 감정 관리
  if (lowerTitle.includes('감정 조절') || lowerTitle.includes('불안 관리') || lowerTitle.includes('우울감')) {
    return 'emotion regulation mental health';
  }
  if (lowerTitle.includes('분노') || lowerTitle.includes('두려움') || lowerTitle.includes('억압')) {
    return 'anger fear emotion expression';
  }
  if (lowerTitle.includes('회복력') || lowerTitle.includes('표현') || lowerTitle.includes('슬픔')) {
    return 'resilience emotional expression healing';
  }

  // 분석, 인사이트
  if (lowerTitle.includes('MBTI') || lowerTitle.includes('Big 5') || lowerTitle.includes('성격 검사')) {
    return 'personality test psychology analysis';
  }
  if (lowerTitle.includes('인지행동치료') || lowerTitle.includes('CBT') || lowerTitle.includes('사고')) {
    return 'cognitive therapy psychology treatment';
  }
  if (lowerTitle.includes('뇌 가소성') || lowerTitle.includes('습관의 힘')) {
    return 'brain plasticity neuroscience habits';
  }
  if (lowerTitle.includes('종합') || lowerTitle.includes('성장 로드맵') || lowerTitle.includes('인생 각본')) {
    return 'growth roadmap life journey transformation';
  }

  // 기본값
  return 'psychology mental health wellness growth';
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

// Pexels API 사용
async function getPexelsImage(keyword: string, apiKey?: string): Promise<string | null> {
  if (!apiKey) {
    return null;
  }

  try {
    // 키워드에서 첫 번째 단어만 사용 (더 정확한 검색)
    const searchTerm = keyword.split(' ')[0];
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`;
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
      // 랜덤하게 하나 선택 (다양성 확보)
      const randomIndex = Math.floor(Math.random() * Math.min(data.photos.length, 5));
      return data.photos[randomIndex].src.large; // 1200x800 크기
    }
  } catch (error) {
    console.error('Pexels API 오류:', error);
  }

  return null;
}

// Unsplash 공식 API 사용
async function getUnsplashImage(keyword: string, apiKey?: string): Promise<string | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const searchTerm = keyword.split(' ')[0];
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
      return data.results[randomIndex].urls.regular; // 1080x720 크기
    }
  } catch (error) {
    console.error('Unsplash API 오류:', error);
  }

  return null;
}

// Unsplash Source API로 이미지 URL 생성 (폴백)
function getUnsplashSourceImageUrl(keyword: string, width: number = 1200, height: number = 630): string {
  const searchTerms = keyword.split(' ').slice(0, 2).join(',');
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}`;
}

// 마크다운 파일에서 제목 추출
function getPostTitle(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/## 제목\s*\n(.+)/);
    return titleMatch ? titleMatch[1].trim() : null;
  } catch (error) {
    return null;
  }
}

// 이미지 다운로드
async function downloadBlogImage(postIndex: number, title: string): Promise<boolean> {
  const fileName = `topic_${String(postIndex).padStart(3, '0')}.jpg`;
  const filePath = path.join(BLOG_IMAGE_DIR, fileName);

  // 이미 존재하면 건너뛰기
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  ${fileName} 이미 존재함`);
    return true;
  }

  const keyword = getImageKeyword(title);
  console.log(`📥 ${fileName} 다운로드 중... (키워드: ${keyword})`);

  // 1. Pexels API 시도 (우선순위 1)
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (pexelsApiKey) {
    try {
      const pexelsUrl = await getPexelsImage(keyword, pexelsApiKey);
      if (pexelsUrl) {
        await downloadImage(pexelsUrl, filePath);
        const stats = fs.statSync(filePath);
        if (stats.size >= 10000) {
          console.log(`✅ ${fileName} 다운로드 완료 (Pexels, ${(stats.size / 1024).toFixed(1)}KB)`);
          return true;
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Pexels 다운로드 실패: ${error}`);
    }
  }

  // 2. Unsplash 공식 API 시도 (우선순위 2)
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashApiKey) {
    try {
      const unsplashUrl = await getUnsplashImage(keyword, unsplashApiKey);
      if (unsplashUrl) {
        await downloadImage(unsplashUrl, filePath);
        const stats = fs.statSync(filePath);
        if (stats.size >= 10000) {
          console.log(`✅ ${fileName} 다운로드 완료 (Unsplash, ${(stats.size / 1024).toFixed(1)}KB)`);
          return true;
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Unsplash API 다운로드 실패: ${error}`);
    }
  }

  // 3. Unsplash Source API 시도 (폴백, 우선순위 3)
  try {
    const unsplashSourceUrl = getUnsplashSourceImageUrl(keyword);
    await downloadImage(unsplashSourceUrl, filePath);
    const stats = fs.statSync(filePath);
    if (stats.size >= 10000) {
      console.log(`✅ ${fileName} 다운로드 완료 (Unsplash Source, ${(stats.size / 1024).toFixed(1)}KB)`);
      return true;
    } else {
      fs.unlinkSync(filePath);
      throw new Error('Downloaded file too small');
    }
  } catch (error) {
    console.error(`❌ ${fileName} 다운로드 실패:`, error);
    return false;
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  let startIndex = 1;
  let endIndex = 100;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
      startIndex = parseInt(args[i + 1], 10);
    } else if (args[i] === '--end' && args[i + 1]) {
      endIndex = parseInt(args[i + 1], 10);
    }
  }

  console.log('📥 블로그 포스트 주제별 이미지 다운로드 시작...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = startIndex; i <= endIndex; i++) {
    const postFile = path.join(POSTS_DIR, `${String(i).padStart(3, '0')}.md`);
    
    if (!fs.existsSync(postFile)) {
      console.log(`⚠️  ${postFile} 파일이 없습니다.`);
      failCount++;
      continue;
    }

    const title = getPostTitle(postFile);
    if (!title) {
      console.log(`⚠️  ${postFile}에서 제목을 찾을 수 없습니다.`);
      failCount++;
      continue;
    }

    const success = await downloadBlogImage(i, title);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // API rate limit 방지를 위한 대기
    if (i < endIndex) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 대기
    }
  }

  console.log(`\n📊 다운로드 완료:`);
  console.log(`  ✅ 성공: ${successCount}개`);
  console.log(`  ❌ 실패: ${failCount}개`);
  console.log(`  📁 저장 위치: ${BLOG_IMAGE_DIR}`);
}

main().catch(console.error);
