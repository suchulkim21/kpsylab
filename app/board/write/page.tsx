'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { safeApiCall, showToast } from '@/lib/utils/errorHandler';

export default function WriteBoardPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !author.trim()) {
      const errorMsg = '제목, 내용, 작성자를 모두 입력해주세요.';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await safeApiCall<{ success: boolean; id: number }>(
        () => fetch('/api/board/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
          }),
        }),
        {
          onError: (err) => {
            setError(err.message);
            showToast(err.message, 'error');
          },
        }
      );

      if (data?.success && data.id) {
        showToast('글이 성공적으로 작성되었습니다.', 'success');
        router.push(`/board/${data.id}`);
      } else {
        const errorMsg = '글 작성에 실패했습니다.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '글 작성에 실패했습니다.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="page-container relative z-10 py-24 md:py-32">
        {/* Back Button */}
        <Link
          href="/board"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로</span>
        </Link>

        {/* Write Form */}
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold text-white mb-8">글쓰기</h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            {/* Author */}
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                작성자 *
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="작성자 이름을 입력하세요"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength={50}
                required
                aria-required="true"
              />
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                제목 *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                maxLength={200}
                required
                aria-required="true"
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                내용 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={20}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono"
                required
                aria-required="true"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
              <Link
                href="/board"
                className="btn btn-secondary"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>작성 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>작성하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

