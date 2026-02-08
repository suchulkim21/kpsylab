'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Calendar, User, ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { safeApiCall, showToast } from '@/lib/utils/errorHandler';

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
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = sessionStorage.getItem('admin-key');
    setAdminKey(key);
    // 관리자 키가 있으면 관리자 모드 기본값을 localStorage에서 가져오기
    if (key) {
      const savedMode = localStorage.getItem('board-admin-mode');
      setAdminMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    fetchPosts(pagination.page);
  }, [adminKey, adminMode]);

  const fetchPosts = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const headers: Record<string, string> = {};
      if (adminKey && adminMode) {
        headers['x-admin-secret'] = adminKey;
      }
      
      const data = await safeApiCall<{ success: boolean; posts: BoardPost[]; pagination: Pagination }>(
        () => fetch(`/api/board/posts?page=${page}&limit=20`, {
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        }),
        {
          onError: (err) => {
            setError(err.message);
            showToast(err.message, 'error');
          },
        }
      );

      if (data?.success) {
        setPosts(data.posts || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '게시글을 불러오는데 실패했습니다.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminMode = () => {
    const newMode = !adminMode;
    setAdminMode(newMode);
    localStorage.setItem('board-admin-mode', String(newMode));
    fetchPosts(pagination.page);
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
    <div className="page">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="page-container relative z-10 py-24 md:py-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <header className="space-y-2 flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                게시판
              </h1>
              {adminKey && (
                <button
                  onClick={toggleAdminMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    adminMode
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-zinc-900/50 border-zinc-700 text-gray-400 hover:border-zinc-600'
                  }`}
                  title={adminMode ? '관리자 모드: 모든 게시글 표시' : '일반 모드: 본인 글만 표시'}
                >
                  {adminMode ? (
                    <>
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">관리자 모드</span>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-4 h-4" />
                      <span className="text-sm font-medium">일반 모드</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-gray-400 text-lg font-light">
              자유롭게 의견을 나누고 소통하는 공간입니다
            </p>
            <p className="text-sm text-gray-500">
              {adminMode && adminKey
                ? '관리자 모드: 모든 게시글을 열람할 수 있습니다.'
                : '본인 글 또는 관리자만 열람할 수 있습니다.'}
            </p>
          </header>
          <Link
            href="/board/write"
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            글쓰기
          </Link>
        </div>

        {/* Posts Table */}
        {isLoading ? (
          <SkeletonLoader variant="table" />
        ) : error ? (
          <div className="card p-12 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchPosts(pagination.page)}
              className="btn btn-primary"
              aria-label="다시 시도"
            >
              다시 시도
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 card">
            <p className="text-gray-400 text-lg">아직 이 맥락에서 작성된 글이 없습니다.</p>
            <Link
              href="/board/write"
              className="btn btn-primary mt-4"
            >
              첫 번째 글 작성하기
            </Link>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-zinc-900/70 border-b border-zinc-800 text-sm font-semibold text-gray-400">
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



