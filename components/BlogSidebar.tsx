'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Tag, Hash, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    tags: string | string[];
    date: string;
}

interface BlogSidebarProps {
    posts: BlogPost[];
    currentPostId?: number;
}

export default function BlogSidebar({ posts, currentPostId }: BlogSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isTagsExpanded, setIsTagsExpanded] = useState(true);
    const [isPostsExpanded, setIsPostsExpanded] = useState(true);

    // 모든 태그 추출 및 카운트
    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        posts.forEach(post => {
            const tags = Array.isArray(post.tags)
                ? post.tags
                : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []);
            tags.forEach(tag => {
                if (tag) {
                    counts[tag] = (counts[tag] || 0) + 1;
                }
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
    }, [posts]);

    // 필터링된 포스트
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch = searchQuery === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase());

            const postTags = Array.isArray(post.tags)
                ? post.tags
                : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []);
            const matchesTag = !selectedTag || postTags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [posts, searchQuery, selectedTag]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag(null);
    };

    const hasActiveFilters = searchQuery !== '' || selectedTag !== null;

    return (
        <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6 space-y-4">
                {/* 사이드바 헤더 */}
                <div className="flex items-center gap-2 px-1 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">포스트 탐색</span>
                </div>

                {/* 검색 박스 */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
                        <div className="flex items-center px-4 py-3">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="제목 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 ml-3"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 활성 필터 표시 */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-gray-500">
                            {filteredPosts.length}개 결과
                        </span>
                        <button
                            onClick={clearFilters}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            필터 초기화
                        </button>
                    </div>
                )}

                {/* 태그 필터 섹션 */}
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-gray-300">태그</span>
                        </div>
                        {isTagsExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {isTagsExpanded && (
                        <div className="px-3 pb-3">
                            <div className="flex flex-wrap gap-1.5">
                                {tagCounts.map(([tag, count]) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all duration-200
                      ${selectedTag === tag
                                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                                                : 'bg-gray-800/60 text-gray-400 border border-transparent hover:bg-gray-800 hover:text-gray-300'
                                            }`}
                                    >
                                        <span>{tag}</span>
                                        <span className={`text-[10px] ${selectedTag === tag ? 'text-purple-400' : 'text-gray-600'}`}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 포스트 목록 섹션 */}
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/80 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setIsPostsExpanded(!isPostsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-300">
                                전체 포스트
                                <span className="ml-1.5 text-xs text-gray-600">
                                    ({filteredPosts.length})
                                </span>
                            </span>
                        </div>
                        {isPostsExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {isPostsExpanded && (
                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            <div className="px-2 pb-2 space-y-0.5">
                                {filteredPosts.map((post) => {
                                    const isActive = post.id === currentPostId;
                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/blog/${post.id}`}
                                            className={`block px-3 py-2.5 rounded-lg transition-all duration-200 group
                        ${isActive
                                                    ? 'bg-purple-500/20 border-l-2 border-purple-500'
                                                    : 'hover:bg-gray-800/50 border-l-2 border-transparent hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className={`text-[10px] font-mono mt-1 flex-shrink-0
                          ${isActive ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-500'}`}>
                                                    #{String(post.id).padStart(3, '0')}
                                                </span>
                                                <span className={`text-sm line-clamp-2 leading-snug
                          ${isActive ? 'text-purple-200 font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                                    {post.title}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}

                                {filteredPosts.length === 0 && (
                                    <div className="px-3 py-6 text-center">
                                        <p className="text-sm text-gray-600">검색 결과가 없습니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 블로그 홈 링크 */}
                <Link
                    href="/blog"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 
            border border-purple-500/20 rounded-xl text-sm text-purple-300 hover:text-purple-200 
            hover:border-purple-500/40 transition-all group"
                >
                    <span>블로그 홈으로</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
            </div>
        </aside>
    );
}
