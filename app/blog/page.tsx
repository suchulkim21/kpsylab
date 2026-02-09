import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';
import { supabase } from '@/lib/db/supabase';
import { Calendar, ArrowRight, BookOpen, Brain, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import BlogSidebar from '@/components/BlogSidebar';

const POSTS_PER_PAGE = 9;

interface BlogPostSummary {
  id: number;
  title: string;
  author: string;
  date: string;
  tags: string | string[];
  content: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/###/g, '').trim();
}

async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, author, date, tags, content')
    .order('id', { ascending: false });
  if (error || !data) return [];
  return data as BlogPostSummary[];
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  if (!BLOG_ENABLED) {
    redirect('/');
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const allPosts = await getBlogPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // 현재 페이지의 포스트만 가져오기
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // 페이지 번호 배열 생성 (현재 페이지 주변)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // 보여줄 페이지 번호 수

    if (totalPages <= showPages + 2) {
      // 전체 페이지가 적으면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // 첫 페이지
      pages.push(1);

      // 중간 페이지들
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis');

      // 마지막 페이지
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Brain className="w-4 h-4" />
            <span>KPSY LAB 인사이트</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            마음의 구조를 읽다
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            고정관념을 해체하고, 새로운 사유의 질서를 세우는 공간.<br />
            <span className="text-purple-400">Potential = Performance − Interference</span>
          </p>

          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{allPosts.length}개의 아티클</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>3단 구조: 해체 → 기제 → 재구성</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* MNPS Banner */}
        <Link href="https://www.kpsylab.com" className="block rounded-2xl overflow-hidden hover:opacity-90 transition-all hover:scale-[1.01] mb-12 shadow-2xl shadow-purple-500/10">
          <Image src="/img/banners/가로.png" alt="KPSY LAB MNPS" width={1200} height={300} className="w-full h-auto" unoptimized />
        </Link>

        <div className="flex gap-8">
          {/* Sidebar */}
          <BlogSidebar posts={allPosts} />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {posts.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">아직 게시된 글이 없습니다.</p>
                <p className="text-sm">곧 새로운 사유가 펼쳐집니다.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post, index) => {
                    const excerpt = stripHtml(post.content).slice(0, 120) + (post.content.length > 120 ? '...' : '');
                    const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []);
                    const isLatest = currentPage === 1 && index < 3;

                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className={`group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden
                      ${isLatest
                            ? 'border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-gray-900/80 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20'
                            : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/80'
                          }`}
                      >
                        {isLatest && (
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                          {/* Post Number Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-mono px-2 py-1 rounded ${isLatest ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                              #{String(post.id).padStart(3, '0')}
                            </span>
                            {isLatest && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                NEW
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className={`text-lg font-bold mb-3 line-clamp-2 transition-colors
                        ${isLatest ? 'text-white group-hover:text-purple-300' : 'text-gray-200 group-hover:text-white'}`}>
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                            {excerpt}
                          </p>

                          {/* Tags */}
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-400 border border-gray-700/50">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Meta & CTA */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              {post.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {post.date}
                                </span>
                              )}
                            </div>
                            <span className={`flex items-center gap-1 text-xs transition-all
                          ${isLatest ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                              읽기 <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-12 flex items-center justify-center gap-2">
                    {/* 이전 페이지 */}
                    {currentPage > 1 ? (
                      <Link
                        href={`/blog?page=${currentPage - 1}`}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">이전</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800/30 text-gray-600 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">이전</span>
                      </span>
                    )}

                    {/* 페이지 번호 */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, idx) => (
                        pageNum === 'ellipsis' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-600">...</span>
                        ) : (
                          <Link
                            key={pageNum}
                            href={`/blog?page=${pageNum}`}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium transition-all
                          ${pageNum === currentPage
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                              }`}
                          >
                            {pageNum}
                          </Link>
                        )
                      ))}
                    </div>

                    {/* 다음 페이지 */}
                    {currentPage < totalPages ? (
                      <Link
                        href={`/blog?page=${currentPage + 1}`}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <span className="hidden sm:inline">다음</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800/30 text-gray-600 cursor-not-allowed">
                        <span className="hidden sm:inline">다음</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </nav>
                )}

                {/* Page Info */}
                <div className="mt-6 text-center text-sm text-gray-600">
                  페이지 {currentPage} / {totalPages} (총 {allPosts.length}개 아티클)
                </div>
              </>
            )}

            {/* Stats Footer */}
            {allPosts.length > 0 && (
              <div className="mt-16 pt-8 border-t border-gray-800/50 text-center">
                <p className="text-sm text-gray-600">
                  총 <span className="text-purple-400 font-semibold">{allPosts.length}</span>개의 아티클 ·
                  마지막 업데이트: <span className="text-gray-400">{allPosts[0]?.date || '—'}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
