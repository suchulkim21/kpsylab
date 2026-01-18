'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, User, Eye } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image: string;
  viewCount?: number;
}

// HTML 태그 제거 및 미리보기 텍스트 생성
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function getPreview(text: string, maxLength: number = 150): string {
  const cleanText = stripHtml(text);
  return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
}

export default function Home() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('/api/blog/posts?limit=20'); // 충분한 수를 가져와서 정렬
        const data = await response.json();
        if (data.success && data.posts.length > 0) {
          // 최신 포스트 1개 (첫 번째)
          const latestPost = data.posts[0];
          
          // 나머지 포스트를 조회수 순으로 정렬
          const otherPosts = data.posts.slice(1)
            .sort((a: BlogPost, b: BlogPost) => {
              const aViews = a.viewCount || 0;
              const bViews = b.viewCount || 0;
              return bViews - aViews; // 내림차순
            })
            .slice(0, 5); // 상위 5개만
          
          // 최신 포스트 + 조회수 상위 5개 조합
          setBlogPosts([latestPost, ...otherPosts]);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 상단 배너 영역 - MNPS & Second Genesis */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MNPS 배너 */}
            <Link href="/mnps" className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-xl">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white">MNPS</h2>
                  </div>
                  <p className="text-white/90 text-lg mb-4">
                    Dark Tetrad 심리 분석을 통해<br />
                    자신의 내면을 탐구하세요
                  </p>
                </div>
                <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  테스트 시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </Link>

            {/* Second Genesis 배너 */}
            <Link href="/second-genesis" className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-xl">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Second Genesis</h2>
                  </div>
                  <p className="text-white/90 text-lg mb-4">
                    전략적 방향 전환 도구로<br />
                    새로운 성장을 시작하세요
                  </p>
                </div>
                <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 영역 (블로그) */}
          <div className="lg:col-span-3">
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">최신 블로그</h2>
                <p className="text-gray-500 text-sm mt-1">심리학 관련 인사이트와 아티클</p>
              </div>
              <Link 
                href="/blog" 
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
              >
                전체 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 블로그 글 목록 */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>등록된 블로그 글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 첫 번째 글 - 큰 카드 */}
                {blogPosts[0] && (
                  <Link 
                    href={`/blog/${blogPosts[0].id}`}
                    className="block group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="md:flex">
                      {blogPosts[0].image && (
                        <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 relative overflow-hidden">
                          <Image
                            src={blogPosts[0].image}
                            alt={blogPosts[0].title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className={`${blogPosts[0].image ? 'md:w-2/3' : 'w-full'} p-6`}>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {blogPosts[0].date}
                          </span>
                          {blogPosts[0].author && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {blogPosts[0].author}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {blogPosts[0].viewCount || 0}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {blogPosts[0].title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {getPreview(blogPosts[0].content, 200)}
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold">
                          자세히 보기
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* 나머지 글들 - 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogPosts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="block group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                    >
                      {post.image && (
                        <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          {post.author && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.author}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.viewCount || 0}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {getPreview(post.content, 100)}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-semibold">
                          읽기
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 빠른 링크 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 링크</h3>
              <div className="space-y-3">
                <Link href="/services" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 border-b border-gray-100">
                  서비스 소개
                </Link>
                <Link href="/board" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 border-b border-gray-100">
                  게시판
                </Link>
                <Link href="/contact" className="block text-gray-700 hover:text-blue-600 transition-colors py-2">
                  문의하기
                </Link>
              </div>
            </div>

            {/* 인기 태그 */}
            {blogPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">인기 태그</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(blogPosts.flatMap(post => 
                    post.tags ? post.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
                  ))).slice(0, 8).map((tag, idx) => (
                    <Link
                      key={idx}
                      href={`/blog?q=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
