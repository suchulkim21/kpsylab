import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image: string;
}

// HTML 태그 제거 함수
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 블로그 포스트 가져오기
async function getBlogPost(id: number): Promise<BlogPost | null> {
  if (!supabase) {
    return null;
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return null;
  }

  return post as BlogPost;
}

// SEO 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return {
      title: '블로그 포스트를 찾을 수 없습니다 | KPSY LAB',
    };
  }

  const post = await getBlogPost(postId);

  if (!post) {
    return {
      title: '블로그 포스트를 찾을 수 없습니다 | KPSY LAB',
    };
  }

  const description = stripHtml(post.content).substring(0, 160);
  const tags = post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [];

  return {
    title: `${post.title} | KPSY LAB`,
    description: description || `${post.title} - 심리학과 행동과학 기반의 인사이트`,
    keywords: ['심리학', '행동과학', '자기계발', ...tags],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'KPSY LAB',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: description,
    },
    alternates: {
      canonical: `/blog/${postId}`,
    },
  };
}

// 구조화된 데이터 (JSON-LD) 생성
function generateStructuredData(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'KPSY LAB',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kpsylab.com'}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kpsylab.com'}/blog/${post.id}`,
    },
    articleSection: 'Psychology',
    keywords: post.tags ? post.tags.split(',').map((t: string) => t.trim()).join(', ') : '',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!BLOG_ENABLED) {
    redirect('/');
  }

  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const post = await getBlogPost(postId);

  if (!post) {
    notFound();
  }

  const structuredData = generateStructuredData(post);
  const tags = post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [];

  return (
    <div className="page">
      <div className="page-container max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        {/* 메인 콘텐츠 */}
        <article className="card">
          {/* 헤더 */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>

            {/* 태그 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

          </header>

          {/* 본문 */}
          <div
            className="blog-content max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 구조화된 데이터 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </article>
      </div>
    </div>
  );
}
