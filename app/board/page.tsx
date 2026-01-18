'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface BoardPost {
  id: number;
  title: string;
  content: string;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts(pagination.page);
  }, []);

  const fetchPosts = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/board/posts?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPosts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <header className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              게시판
            </h1>
            <p className="text-gray-400 text-lg font-light">
              자유롭게 의견을 나누고 소통하는 공간입니다
            </p>
          </header>
          <Link
            href="/board/write"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            글쓰기
          </Link>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-gray-400 mt-4">로딩 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-gray-400 text-lg">아직 작성된 글이 없습니다.</p>
            <Link
              href="/board/write"
              className="inline-block mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
            >
              첫 번째 글 작성하기
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-zinc-800/50 border-b border-zinc-700 text-sm font-semibold text-gray-400">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-5">제목</div>
                <div className="col-span-2">작성자</div>
                <div className="col-span-2">작성일</div>
                <div className="col-span-2 text-center">조회수</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-zinc-800">
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/board/${post.id}`}
                    className="block md:grid md:grid-cols-12 gap-4 p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-white flex-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <span className="text-sm text-gray-500 ml-2">#{post.id}</span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {truncateContent(post.content)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:contents">
                      <div className="col-span-1 text-center text-gray-400">
                        {pagination.total - (pagination.page - 1) * pagination.limit - index}
                      </div>
                      <div className="col-span-5">
                        <h3 className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                      </div>
                      <div className="col-span-2 text-gray-400">
                        {post.author}
                      </div>
                      <div className="col-span-2 text-gray-400 text-sm">
                        {formatDate(post.created_at)}
                      </div>
                      <div className="col-span-2 text-center text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-indigo-500 text-white'
                            : 'bg-zinc-900/50 border border-zinc-800 text-gray-400 hover:bg-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}



