import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 텍스트 미리보기 생성
function getPreview(text: string, maxLength: number = 200): string {
  const cleanText = stripHtml(text);
  return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
}

// XML 이스케이프
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kpsylab.com';
  const siteName = 'KPSY LAB';
  const siteDescription = '심리학과 행동과학 기반의 인사이트를 제공하는 블로그';

  let items = '';

  if (BLOG_ENABLED && supabase) {
    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('id', { ascending: false })
        .limit(50); // 최신 50개만

      if (!error && posts && posts.length > 0) {
        // 제목 중복 제거 (최신만 유지)
        const titleMap = new Map<string, any>();
        posts.forEach((post: any) => {
          const key = String(post.title || '').trim();
          if (key && !titleMap.has(key)) {
            titleMap.set(key, post);
          }
        });

        const uniquePosts = Array.from(titleMap.values());

        items = uniquePosts
          .map((post) => {
            const url = `${baseUrl}/blog/${post.id}`;
            const title = escapeXml(post.title || '');
            const description = escapeXml(getPreview(post.content || ''));
            const author = escapeXml(post.author || 'KPSY LAB');
            const pubDate = new Date(post.date || new Date()).toUTCString();

            return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <author>${author}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
          })
          .join('\n');
      }
    } catch (error) {
      console.error('RSS 피드 생성 실패:', error);
    }
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
