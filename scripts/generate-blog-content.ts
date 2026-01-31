/**
 * 블로그 콘텐츠 생성 스크립트
 * AI를 사용하여 블로그 포스트를 생성하고 Supabase에 저장
 * 
 * 사용법:
 *   npx tsx scripts/generate-blog-content.ts --topic "주제" --category "카테고리"
 *   npx tsx scripts/generate-blog-content.ts --file blog_topics.md --count 5
 */

import dotenv from 'dotenv';
import * as nodePath from 'path';

// .env.local 파일 명시적으로 로드
dotenv.config({ path: nodePath.join(process.cwd(), '.env.local') });
// .env 파일도 로드 (없어도 무방)
dotenv.config();

import { supabase } from '../lib/db/supabase';
import {
  generatePrompt,
  validateContentQuality,
  normalizeContent,
  checkSimilarity,
  type ContentGenerationConfig,
  type BlogPostData,
} from '../lib/utils/blogContentGenerator';
import * as fs from 'fs';

// AI API 호출 (OpenAI 또는 Anthropic)
async function callAI(prompt: string): Promise<BlogPostData | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ AI API 키가 설정되지 않았습니다.');
    console.error('   OPENAI_API_KEY 또는 ANTHROPIC_API_KEY 환경 변수를 설정하세요.');
    return null;
  }

  try {
    if (useOpenAI) {
      // OpenAI API 호출
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '당신은 전문적인 심리학 블로그 작가입니다. HTML 형식으로 블로그 포스트를 작성하고 JSON 형식으로 응답합니다.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API 오류:', error);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('응답 내용이 없습니다.');
        return null;
      }

      const parsed = JSON.parse(content);
      return {
        title: parsed.title,
        content: parsed.content,
        tags: parsed.tags || '',
        author: 'KPSY LAB',
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      // Anthropic Claude API 호출
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Anthropic API 오류:', error);
        return null;
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        console.error('응답 내용이 없습니다.');
        return null;
      }

      // JSON 추출 (마크다운 코드 블록 제거)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('JSON 형식을 찾을 수 없습니다.');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        title: parsed.title,
        content: parsed.content,
        tags: parsed.tags || '',
        author: 'KPSY LAB',
        date: new Date().toISOString().split('T')[0],
      };
    }
  } catch (error) {
    console.error('AI API 호출 실패:', error);
    return null;
  }
}

// 기존 포스트 가져오기 (유사도 검사용)
async function getExistingPosts(): Promise<string[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('content')
      .limit(100);

    if (error || !data) {
      return [];
    }

    return data.map(p => p.content || '').filter(c => c.length > 0);
  } catch (error) {
    console.error('기존 포스트 조회 실패:', error);
    return [];
  }
}

// Supabase에 저장
async function saveToSupabase(post: BlogPostData): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        content: normalizeContent(post.content),
        author: post.author,
        date: post.date,
        tags: post.tags,
        image: post.image || '',
      });

    if (error) {
      console.error('❌ 저장 실패:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ 저장 중 오류:', error);
    return false;
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  const categoryIndex = args.indexOf('--category');
  const fileIndex = args.indexOf('--file');
  const countIndex = args.indexOf('--count');

  if (topicIndex === -1 && fileIndex === -1) {
    console.log('사용법:');
    console.log('  npx tsx scripts/generate-blog-content.ts --topic "주제" [--category "카테고리"]');
    console.log('  npx tsx scripts/generate-blog-content.ts --file blog_topics.md [--count 5]');
    process.exit(1);
  }

  let topics: string[] = [];

  if (topicIndex !== -1) {
    // 단일 주제
    const topic = args[topicIndex + 1];
    if (!topic) {
      console.error('❌ --topic 뒤에 주제를 입력하세요.');
      process.exit(1);
    }
    topics = [topic];
  } else if (fileIndex !== -1) {
    // 파일에서 주제 읽기
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ --file 뒤에 파일 경로를 입력하세요.');
      process.exit(1);
    }

    const fullPath = nodePath.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${fullPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    // 마크다운 리스트에서 주제 추출 (번호, 불릿, 또는 일반 텍스트 줄 모두 지원)
    const lines = content.split('\n');
    topics = lines
      .map(line => {
        // 번호 형식 (1. 주제) 제거
        line = line.replace(/^\d+\.\s*/, '');
        // 불릿 형식 (- 주제) 제거
        line = line.replace(/^-\s*/, '');
        // 마크다운 헤더 (#) 제거
        line = line.replace(/^#+\s*/, '');
        return line.trim();
      })
      .filter(t => t.length > 0 && !t.startsWith('##')); // 빈 줄과 헤더 제외

    const count = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : topics.length;
    topics = topics.slice(0, count);
  }

  const category = categoryIndex !== -1 ? args[categoryIndex + 1] : undefined;

  console.log(`📝 ${topics.length}개의 주제로 블로그 포스트 생성 시작...\n`);

  const existingPosts = await getExistingPosts();

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`[${i + 1}/${topics.length}] "${topic}" 생성 중...`);

    const config: ContentGenerationConfig = {
      topic,
      category,
      targetLength: 3000,
      style: 'professional',
      includeExamples: true,
    };

    const prompt = generatePrompt(config);
    const post = await callAI(prompt);

    if (!post) {
      console.error(`  ❌ 생성 실패\n`);
      continue;
    }

    // 품질 검증
    const quality = validateContentQuality(post);
    if (quality.issues.length > 0) {
      console.warn(`  ⚠️  품질 검증 경고:`);
      quality.issues.forEach(issue => console.warn(`     - ${issue}`));
    }

    // 유사도 검사
    if (existingPosts.length > 0) {
      const similarity = checkSimilarity(post.content, existingPosts);
      if (similarity > 20) {
        console.warn(`  ⚠️  유사도가 높습니다: ${similarity.toFixed(1)}% (권장: 20% 미만)`);
      }
    }

    // 저장
    const saved = await saveToSupabase(post);
    if (saved) {
      console.log(`  ✅ 저장 완료: "${post.title}"`);
      existingPosts.push(post.content); // 다음 검증을 위해 추가
    } else {
      console.error(`  ❌ 저장 실패`);
    }

    console.log(''); // 빈 줄

    // API rate limit 방지 (1초 대기)
    if (i < topics.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('✨ 완료!');
}

// 실행
main().catch(console.error);
