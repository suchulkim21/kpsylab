/**
 * 관리자용 블로그 콘텐츠 생성 API
 * AI를 사용하여 블로그 포스트를 생성하고 저장
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import {
  generatePrompt,
  validateContentQuality,
  normalizeContent,
  checkSimilarity,
  type ContentGenerationConfig,
  type BlogPostData,
} from '@/lib/utils/blogContentGenerator';

// AI API 호출
async function callAI(prompt: string): Promise<BlogPostData | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    if (useOpenAI) {
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
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return null;
      }

      const parsed = JSON.parse(content);
      return {
        title: parsed.title,
        content: parsed.content,
        tags: parsed.tags || '',
        author: parsed.author || 'KPSY LAB',
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      // Anthropic Claude
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
        return null;
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        return null;
      }

      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        title: parsed.title,
        content: parsed.content,
        tags: parsed.tags || '',
        author: parsed.author || 'KPSY LAB',
        date: new Date().toISOString().split('T')[0],
      };
    }
  } catch (error) {
    console.error('AI API 호출 실패:', error);
    return null;
  }
}

// 기존 포스트 가져오기
async function getExistingPosts(): Promise<string[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('content')
      .limit(100);

    return (data || []).map(p => p.content || '').filter(c => c.length > 0);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    // 관리자 인증 확인
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic, category, targetLength, style, includeExamples } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const config: ContentGenerationConfig = {
      topic,
      category,
      targetLength: targetLength || 3000,
      style: style || 'professional',
      includeExamples: includeExamples !== false,
    };

    // AI 콘텐츠 생성
    const prompt = generatePrompt(config);
    const post = await callAI(prompt);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate content. Check API keys.' },
        { status: 500 }
      );
    }

    // 품질 검증
    const quality = validateContentQuality(post);
    
    // 유사도 검사
    const existingPosts = await getExistingPosts();
    const similarity = existingPosts.length > 0
      ? checkSimilarity(post.content, existingPosts)
      : 0;

    // 미리보기 반환 (저장하지 않음)
    return NextResponse.json({
      success: true,
      post: {
        ...post,
        content: normalizeContent(post.content),
      },
      quality: {
        ...quality,
        similarity: Math.round(similarity * 10) / 10,
      },
    });
  } catch (error) {
    console.error('블로그 콘텐츠 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
