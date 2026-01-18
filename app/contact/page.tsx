'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Send, Eye } from 'lucide-react';

interface Inquiry {
  id: string;
  content: string;
  email?: string;
  createdAt: string;
  answer?: string;
}

export default function ContactPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myInquiryIds, setMyInquiryIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  useEffect(() => {
    fetchInquiries();
    // Load my inquiries from local storage
    const savedIds = localStorage.getItem('myInquiryIds');
    if (savedIds) {
      try {
        setMyInquiryIds(JSON.parse(savedIds));
      } catch (e) {
        console.error('Error parsing saved inquiry IDs:', e);
      }
    }
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, email }),
      });

      if (res.ok) {
        const newInquiry = await res.json();

        // Update local storage
        const updatedIds = [...myInquiryIds, newInquiry.id];
        setMyInquiryIds(updatedIds);
        localStorage.setItem('myInquiryIds', JSON.stringify(updatedIds));

        setContent('');
        setEmail('');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Failed to post inquiry', error);
      alert('문의 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInquiries = filter === 'all'
    ? inquiries
    : inquiries.filter(i => myInquiryIds.includes(i.id));

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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            문의
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-widest uppercase">
            Contact & Support
          </p>
          <p className="text-gray-300 text-base max-w-2xl mx-auto mt-6">
            궁금한 점이나 제안사항을 자유롭게 남겨주세요.
          </p>
        </header>

        {/* Contact Information */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-12 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">일반 문의</h2>
            <p className="text-gray-400 mb-4">
              서비스, 파트너십 기회 또는 미디어 관련 일반적인 문의 사항은 다음 주소로 이메일을 보내주세요:
            </p>
            <a
              href="mailto:support@example.com"
              className="text-lg font-bold text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              support@example.com
            </a>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-2">기술 지원</h2>
            <p className="text-gray-400 mb-4">
              웹사이트 또는 평가 도구에 문제가 있는 경우 기술 팀에 문의하세요:
            </p>
            <a
              href="mailto:dev@example.com"
              className="text-lg font-medium text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              dev@example.com
            </a>
          </div>
        </section>

        {/* Inquiry Form */}
        <section className="space-y-8 mb-12">
          <header>
            <h2 className="text-3xl font-bold text-white mb-2">익명 문의 게시판</h2>
            <p className="text-gray-400">자유롭게 문의를 남겨주세요. 익명으로 게시됩니다.</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                이메일 (선택사항)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="답변 알림을 받을 이메일을 입력하세요"
                className="w-full bg-zinc-950 text-white p-3 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                문의 내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문의 내용을 입력하세요..."
                rows={6}
                className="w-full bg-zinc-950 text-white p-4 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none outline-none"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>등록 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>문의 등록</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Inquiry List */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">최근 문의</h2>
            <div className="flex space-x-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-rose-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                전체 문의
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'my' 
                    ? 'bg-rose-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                내 문의 내역
              </button>
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all' 
                  ? '아직 등록된 문의가 없습니다. 첫 문의를 남겨보세요!'
                  : '내 문의 내역이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => {
                const isMyPost = myInquiryIds.includes(inquiry.id);
                return (
                  <div
                    key={inquiry.id}
                    className={`bg-zinc-900/40 p-6 rounded-xl border transition-colors ${
                      isMyPost
                        ? 'border-rose-500/50 bg-rose-900/10'
                        : 'border-zinc-800 hover:border-rose-500/30'
                    }`}
                  >
                    <p className="text-gray-200 whitespace-pre-line mb-4">{inquiry.content}</p>

                    {/* Admin Reply */}
                    {inquiry.answer && (
                      <div className="mt-4 p-4 bg-rose-900/20 rounded-lg border border-rose-500/30">
                        <p className="text-rose-300 font-bold text-sm mb-1">
                          ↳ 관리자 답변
                        </p>
                        <p className="text-rose-100/80 text-sm whitespace-pre-line">
                          {inquiry.answer}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
                      <div className="flex items-center gap-2">
                        <span>{inquiry.email ? '이메일 알림 요청' : '익명'}</span>
                        {isMyPost && (
                          <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                            MY
                          </span>
                        )}
                      </div>
                      <span>{formatDate(inquiry.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}



