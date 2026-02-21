'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Tag, Hash, ChevronDown, ChevronUp, Sparkles, X, FolderOpen, Folder } from 'lucide-react';

const MAIN_CATEGORIES = [
    "마케팅 심리학",
    "인지·뇌과학",
    "마음챙김·치유",
    "성장·자기계발",
    "인간관계·사회",
    "일반 심리학"
];

interface BlogPost {
    id: number;
    title: string;
    tags: string | string[];
    date: string;
}

interface BlogSidebarProps {
    posts: BlogPost[];
    currentPostId?: number;
    currentTag?: string | null;
}

export default function BlogSidebar({ posts, currentPostId, currentTag }: BlogSidebarProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(currentTag || null);
    const [isTagsExpanded, setIsTagsExpanded] = useState(true);
    const [isPostsExpanded, setIsPostsExpanded] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    // 모인 카테고리 추출
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        MAIN_CATEGORIES.forEach(c => counts[c] = 0);

        posts.forEach(post => {
            const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.replace(/["']/g, '').trim()) : []);
            tags.forEach(tag => {
                if (MAIN_CATEGORIES.includes(tag)) {
                    counts[tag] = (counts[tag] || 0) + 1;
                }
            });
        });
        return Object.entries(counts).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    }, [posts]);

    // 기타 태그 추출 및 카운트
    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        posts.forEach(post => {
            const tags = Array.isArray(post.tags)
                ? post.tags
                : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.replace(/["']/g, '').trim()) : []);
            tags.forEach(tag => {
                if (tag && !MAIN_CATEGORIES.includes(tag)) {
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
                : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.replace(/["']/g, '').trim()) : []);
            const matchesTag = !selectedTag || postTags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [posts, searchQuery, selectedTag]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag(null);
        if (currentTag) {
            router.push('/blog');
        }
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
                                        onClick={() => {
                                            const newTag = selectedTag === tag ? null : tag;
                                            setSelectedTag(newTag);
                                            if (newTag) {
                                                router.push(`/blog?tag=${encodeURIComponent(newTag)}`);
                                            } else {
                                                router.push('/blog');
                                            }
                                        }}
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

                {/* 포스트 목록 섹션 (카테고리 그룹핑) */}
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
                        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            <div className="px-2 pb-2 space-y-2">
                                {/* 카테고리별 포스트 그룹핑 */}
                                {MAIN_CATEGORIES.map(category => {
                                    const postsInCategory = filteredPosts.filter(post => {
                                        const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.replace(/["']/g, '').trim()) : []);
                                        return tags.includes(category);
                                    });

                                    if (postsInCategory.length === 0) return null;

                                    const isExpanded = !!expandedCategories[category]; // 기본적으로 접힘

                                    return (
                                        <div key={category} className="border border-gray-800/40 rounded-lg overflow-hidden bg-gray-900/30">
                                            <button
                                                onClick={() => toggleCategory(category)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${isExpanded ? 'bg-gray-800/80' : 'bg-gray-800/40 hover:bg-gray-800/60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? (
                                                        <FolderOpen className="w-4 h-4 text-purple-400" />
                                                    ) : (
                                                        <Folder className="w-4 h-4 text-blue-400" />
                                                    )}
                                                    <span className={`font-medium ${isExpanded ? 'text-sm text-gray-200' : 'text-xs text-gray-300'}`}>{category}</span>
                                                    <span className="text-[10px] bg-gray-700/60 text-gray-300 px-1.5 py-0.5 rounded-md ml-1">
                                                        {postsInCategory.length}
                                                    </span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                                )}
                                            </button>

                                            {isExpanded && (
                                                <div className="bg-gray-900/20 divide-y divide-gray-800/30">
                                                    {postsInCategory.map((post) => {
                                                        const isActive = post.id === currentPostId;
                                                        return (
                                                            <Link
                                                                key={post.id}
                                                                href={`/blog/${post.id}`}
                                                                className={`block pl-9 pr-3 py-2.5 transition-all duration-200 group relative
                                                                    ${isActive
                                                                        ? 'bg-purple-500/10 border-l-[3px] border-purple-500'
                                                                        : 'hover:bg-gray-800/30 border-l-[3px] border-transparent hover:border-gray-700'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-2.5">
                                                                    <span className={`text-[10px] font-mono mt-0.5 flex-shrink-0
                                                                        ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                                                        #{String(post.id).padStart(3, '0')}
                                                                    </span>
                                                                    <span className={`text-xs line-clamp-2 leading-snug
                                                                        ${isActive ? 'text-purple-200 font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                                        {post.title}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* 카테고리가 없는 포스트들 */}
                                {(() => {
                                    const categoryPosts = filteredPosts.filter(post => {
                                        const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.replace(/["']/g, '').trim()) : []);
                                        return !MAIN_CATEGORIES.some(cat => tags.includes(cat));
                                    });

                                    if (categoryPosts.length === 0) return null;

                                    const isExpanded = !!expandedCategories['기타']; // 기본적으로 접힘
                                    return (
                                        <div className="border border-gray-800/40 rounded-lg overflow-hidden bg-gray-900/30 mt-3">
                                            <button
                                                onClick={() => toggleCategory('기타')}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${isExpanded ? 'bg-gray-800/80' : 'bg-gray-800/40 hover:bg-gray-800/60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? (
                                                        <FolderOpen className="w-4 h-4 text-purple-400" />
                                                    ) : (
                                                        <Folder className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <span className={`font-medium ${isExpanded ? 'text-sm text-gray-200' : 'text-xs text-gray-500'}`}>기타</span>
                                                    <span className="text-[10px] bg-gray-700/60 text-gray-500 px-1.5 py-0.5 rounded-md ml-1">
                                                        {categoryPosts.length}
                                                    </span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                                )}
                                            </button>

                                            {isExpanded && (
                                                <div className="bg-gray-900/20 divide-y divide-gray-800/30">
                                                    {categoryPosts.map((post) => {
                                                        const isActive = post.id === currentPostId;
                                                        return (
                                                            <Link
                                                                key={post.id}
                                                                href={`/blog/${post.id}`}
                                                                className={`block pl-9 pr-3 py-2.5 transition-all duration-200 group relative
                                                                    ${isActive
                                                                        ? 'bg-purple-500/10 border-l-[3px] border-purple-500'
                                                                        : 'hover:bg-gray-800/30 border-l-[3px] border-transparent hover:border-gray-700'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-2.5">
                                                                    <span className={`text-[10px] font-mono mt-0.5 flex-shrink-0
                                                                        ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                                                        #{String(post.id).padStart(3, '0')}
                                                                    </span>
                                                                    <span className={`text-xs line-clamp-2 leading-snug
                                                                        ${isActive ? 'text-purple-200 font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                                        {post.title}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

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
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-300 hover:text-purple-200 hover:border-purple-500/40 transition-all group"
                >
                    <span>블로그 홈으로</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
            </div>
        </aside>
    );
}
