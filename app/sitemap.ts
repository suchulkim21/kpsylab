import { MetadataRoute } from 'next';
import { supabase } from '@/lib/db/supabase';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kpsylab.com';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/mnps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mnps/test`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/growth-roadmap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/board`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 블로그 포스트 동적 생성 (BLOG_ENABLED일 때만)
  let blogPages: MetadataRoute.Sitemap = [];

  if (BLOG_ENABLED && supabase) {
    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, date, updated_at')
        .order('id', { ascending: false })
        .limit(1000); // 최대 1000개 (Google 권장)

      if (!error && posts) {
        // 제목 중복 제거 (최신만 유지)
        const titleMap = new Map<string, { id: number; date: string; updated_at?: string }>();
        posts.forEach((post: any) => {
          const key = String(post.title || '').trim();
          if (key && !titleMap.has(key)) {
            titleMap.set(key, {
              id: post.id,
              date: post.date,
              updated_at: post.updated_at,
            });
          }
        });

        blogPages = Array.from(titleMap.values()).map((post) => ({
          url: `${baseUrl}/blog/${post.id}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.date),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error('블로그 포스트 사이트맵 생성 실패:', error);
    }
  }

  return [...staticPages, ...blogPages];
}
