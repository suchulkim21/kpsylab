'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Search } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchRecentPosts();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blog/posts/${id}`);
      const data = await response.json();
      
      if (data.success && data.post) {
        setPost(data.post);
      } else {
        router.push('/blog');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      
      if (data.success && data.posts) {
        // 현재 글 제외하고 최신 5개만
        const filtered = data.posts
          .filter((p: BlogPost) => p.id !== Number(id))
          .slice(0, 5);
        setRecentPosts(filtered);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-gray-400 mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>블로그 목록으로</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-2 space-y-8">
            {/* Header */}
            <header className="space-y-6">
              {/* Meta */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author || 'MNPS Editor'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                {post.title}
              </h1>
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="w-full h-96 bg-zinc-800 rounded-xl overflow-hidden relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  onError={() => {
                    console.error('Image load error:', post.image);
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                prose-h1:text-3xl prose-h1:border-b prose-h1:border-gray-700 prose-h1:pb-3 prose-h1:mb-6
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-strong:text-white prose-strong:font-bold
                prose-ul:text-gray-300 prose-ul:mb-6 prose-ul:space-y-2 prose-ul:pl-6
                prose-ol:text-gray-300 prose-ol:mb-6 prose-ol:space-y-2 prose-ol:pl-6
                prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-l-amber-500 prose-blockquote:text-gray-300 
                prose-blockquote:bg-zinc-900/50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-6 
                prose-blockquote:italic prose-blockquote:rounded-r-lg
                prose-code:text-amber-400 prose-code:bg-zinc-900 prose-code:px-2 prose-code:py-1 prose-code:rounded 
                prose-code:text-sm prose-code:font-mono
                prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg 
                prose-pre:p-4 prose-pre:my-6 prose-pre:overflow-x-auto
                prose-img:rounded-xl prose-img:my-8 prose-img:shadow-xl
                prose-hr:border-gray-700 prose-hr:my-8
                prose-table:border-collapse prose-table:w-full prose-table:my-6
                prose-th:border prose-th:border-gray-700 prose-th:bg-zinc-900 prose-th:px-4 prose-th:py-2 prose-th:text-left
                prose-td:border prose-td:border-gray-700 prose-td:px-4 prose-td:py-2
                [&>p]:mb-4 [&>p:last-child]:mb-0
                [&>h1+p]:mt-0 [&>h2+p]:mt-0 [&>h3+p]:mt-0
                [&>ul]:mb-4 [&>ol]:mb-4
                [&>blockquote+p]:mt-6
                [&>hr+p]:mt-8
                [&>img+p]:mt-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">최신 글</h2>
                <ul className="space-y-4">
                  {recentPosts.map((recentPost) => (
                    <li key={recentPost.id}>
                      <Link
                        href={`/blog/${recentPost.id}`}
                        className="block group hover:text-amber-400 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 line-clamp-2 mb-1">
                          {recentPost.title}
                        </h3>
                        <p className="text-xs text-gray-400">{recentPost.date}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Back to Blog */}
            <Link
              href="/blog"
              className="block w-full text-center px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-amber-400 font-semibold transition-all"
            >
              모든 글 보기
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}



