'use client';

import { useState } from 'react';
import { Save, X, FileText, Tag, User, Calendar } from 'lucide-react';
import { showToast } from '@/lib/utils/errorHandler';
import { LoadingSpinner } from './LoadingSpinner';

interface BlogPost {
  id?: number;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image: string;
}

interface BlogPostEditorProps {
  adminKey: string;
  post?: BlogPost;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogPostEditor({ adminKey, post, onSave, onCancel }: BlogPostEditorProps) {
  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || '',
    content: post?.content || '',
    author: post?.author || 'KPSY LAB',
    date: post?.date || new Date().toISOString().split('T')[0],
    tags: post?.tags || '',
    image: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'content') {
      // HTML 태그 제거 후 단어 수 계산
      const text = value.replace(/<[^>]*>/g, ' ').trim();
      setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    if (wordCount < 1000) {
      if (!confirm(`현재 단어 수가 ${wordCount}개입니다. 최소 3,000자(약 1,000단어)를 권장합니다. 계속하시겠습니까?`)) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          ...formData,
          force: true, // 품질 검증 우회 (수동 작성이므로)
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('블로그 포스트가 저장되었습니다.', 'success');
        onSave();
      } else {
        showToast(data.error || '저장에 실패했습니다.', 'error');
      }
    } catch (error: any) {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      console.error('저장 오류:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-4xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            {post ? '블로그 포스트 수정' : '새 블로그 포스트 작성'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              제목 *
            </label>
            <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="블로그 포스트 제목을 입력하세요"
                disabled={isSaving}
              />
          </div>

          {/* 작성자, 날짜, 태그 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                작성자
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                발행일
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 심리학,자기계발,성장"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* 내용 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                내용 * (HTML 형식)
              </label>
              <span className="text-xs text-gray-500">
                단어 수: {wordCount.toLocaleString()}개
                {wordCount < 1000 && <span className="text-yellow-400 ml-1">(권장: 1,000단어 이상)</span>}
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={20}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="<h3>제목</h3>&#10;<p>본문 내용을 HTML 형식으로 입력하세요...</p>"
              disabled={isSaving}
            />
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>• HTML 태그 사용 가능: &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; 등</p>
              <p>• &lt;h1&gt;, &lt;h2&gt;는 사용하지 마세요. &lt;h3&gt;만 사용하세요.</p>
              <p>• 최소 3,000자(약 1,000단어) 이상 권장</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <LoadingSpinner size="sm" />}
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
