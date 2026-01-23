'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar, User, Edit, Trash2, Lock, Shield, ShieldOff } from 'lucide-react';

interface BoardPost {
  id: number;
  title: string;
  content: string;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export default function BoardPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [post, setPost] = useState<BoardPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    const key = sessionStorage.getItem('admin-key');
    setAdminKey(key);
    if (key) {
      const savedMode = localStorage.getItem('board-admin-mode');
      setAdminMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, adminKey, adminMode]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setIsForbidden(false);
      const headers: Record<string, string> = {};
      if (adminKey && adminMode) {
        headers['x-admin-secret'] = adminKey;
      }
      const response = await fetch(`/api/board/posts/${id}`, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      const data = await response.json();

      if (response.status === 403 || data.forbidden) {
        setIsForbidden(true);
        return;
      }

      if (data.success && data.post) {
        setPost(data.post);
      } else {
        router.push('/board');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/board');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminMode = () => {
    const newMode = !adminMode;
    setAdminMode(newMode);
    localStorage.setItem('board-admin-mode', String(newMode));
    fetchPost();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/board/posts/${id}`, {
        method: 'DELETE',
        headers: adminKey ? { 'x-admin-secret': adminKey } : undefined,
      });

      const data = await response.json();

      if (data.success) {
        router.push('/board');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('삭제에 실패했습니다.');
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

  if (isLoading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="page">
        {/* Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full" />
        </div>

        <main className="page-container relative z-10 py-24 md:py-32">
          <div className="card p-12 text-center max-w-2xl mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-red-500/10 rounded-full">
                <Lock className="w-16 h-16 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              접근 권한이 없습니다
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              이 게시글은 작성자 본인 또는 관리자만 열람할 수 있습니다.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              본인이 작성한 게시글만 조회할 수 있습니다.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/board"
                className="btn btn-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                게시판으로 돌아가기
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="page">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="page-container relative z-10 py-24 md:py-32">
        {/* Back Button and Admin Toggle */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>목록으로</span>
          </Link>
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

        {/* Post Content */}
        <article className="card overflow-hidden">
          {/* Header */}
          <header className="p-6 border-b border-zinc-800 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>조회 {post.views}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-ul:text-gray-300
                prose-ol:text-gray-300
                prose-li:text-gray-300
                prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-300
                prose-code:text-indigo-400 prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
                whitespace-pre-wrap"
            >
              {post.content}
            </div>
          </div>
        </article>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            href="/board"
            className="btn btn-secondary"
          >
            목록
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">정말 삭제하시겠습니까?</h3>
              <p className="text-gray-400 mb-6">
                삭제한 게시글은 복구할 수 없습니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    handleDelete();
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



