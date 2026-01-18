'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  FileText,
  Activity,
  TrendingUp,
  Server,
  Shield,
  ArrowLeft,
  RefreshCw,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsTotal: number;
  referrers: { referrer: string; count: number }[];
  topPages: { pagePath: string; viewCount: number; pageType?: string }[];
  serviceUsage: { serviceName: string; usageCount: number; avgDuration: number }[];
  blogPostViews: { postId: number; title: string; viewCount: number }[];
  deviceTypes: { deviceType: string; count: number }[];
  dailyTrend: { date: string; visits: number; uniqueVisitors: number }[];
}

interface AnalysisInsight {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  impact: string;
}

interface Analysis {
  insights: AnalysisInsight[];
  summary: string;
  keyMetrics: {
    growthRate: number;
    engagementRate: number;
    retentionRate: number;
  };
  strategicRecommendations: string[];
}

interface Stats {
  totalUsers: number;
  todaySignups: number;
  weekSignups: number;
  totalBlogPosts: number;
  masterAccounts: number;
  systemStatus: {
    server: string;
    mnpsService: string;
    secondGenesisService: string;
    database: string;
    diskSpace: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading && (!user || user.role !== 'master')) {
      router.push('/');
      return;
    }

    if (user && user.role === 'master') {
      fetchAllData();
    }
  }, [user, loading, router]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 기본 통계
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 분석 데이터
      const analyticsResponse = await fetch('/api/admin/analytics');
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
        setAnalysis(analyticsData.analysis);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'master') {
    return null;
  }

  if (error && !stats && !analytics) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl font-bold mb-4">오류 발생</div>
        <p className="text-gray-400 mb-8">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-900/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-900/10';
      default:
        return 'border-blue-500/50 bg-blue-900/10';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'online' || status === 'ok' || status === 'high') return 'text-green-500';
    if (status === 'warn' || status === 'medium') return 'text-yellow-500';
    if (status === 'offline' || status === 'error' || status === 'low') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">관리자 대시보드</h1>
            <p className="text-gray-400 text-sm">
              마지막 업데이트: {lastRefresh.toLocaleTimeString('ko-KR')}
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>

        {/* 핵심 메트릭 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-blue-400" />
              {analysis?.keyMetrics.growthRate && (
                <div className={`flex items-center gap-1 ${analysis.keyMetrics.growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.keyMetrics.growthRate > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-bold">{Math.abs(analysis.keyMetrics.growthRate)}%</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">누적 접속자 수</p>
            <p className="text-3xl font-bold text-white">{(analytics?.totalVisits ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">고유 방문자: {(analytics?.uniqueVisitorsTotal ?? 0).toLocaleString()}명</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/50 rounded-xl p-6">
            <Activity className="w-8 h-8 text-green-400 mb-4" />
            <p className="text-gray-400 text-sm mb-1">당일 접속자 수</p>
            <p className="text-3xl font-bold text-white">{(analytics?.todayVisits ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">고유 방문자: {(analytics?.uniqueVisitorsToday ?? 0).toLocaleString()}명</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/50 rounded-xl p-6">
            <Users className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-gray-400 text-sm mb-1">총 사용자 수</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">오늘 가입: {stats?.todaySignups || 0}명</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/50 rounded-xl p-6">
            <FileText className="w-8 h-8 text-yellow-400 mb-4" />
            <p className="text-gray-400 text-sm mb-1">블로그 포스트</p>
            <p className="text-3xl font-bold text-white">{(stats?.totalBlogPosts ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">인기 포스트 조회수 추적 중</p>
          </div>
        </section>

        {/* 종합 분석 인사이트 */}
        {analysis && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">종합 분석 엔진</h2>
            </div>

            {/* 요약 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                서비스 현황 요약
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{analysis.summary}</p>
              
              {/* 핵심 메트릭 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">성장률</p>
                  <p className={`text-2xl font-bold ${analysis.keyMetrics.growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysis.keyMetrics.growthRate > 0 ? '+' : ''}{analysis.keyMetrics.growthRate}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">참여도</p>
                  <p className="text-2xl font-bold text-blue-400">{analysis.keyMetrics.engagementRate}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">재방문율</p>
                  <p className="text-2xl font-bold text-purple-400">{analysis.keyMetrics.retentionRate}%</p>
                </div>
              </div>
            </div>

            {/* 인사이트 카드 */}
            {analysis.insights.length > 0 && (
              <div className="space-y-4 mb-6">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl p-6 ${getPriorityColor(insight.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                            {insight.category}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {insight.priority === 'high' ? '높음' : insight.priority === 'medium' ? '중간' : '낮음'}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">{insight.title}</h4>
                        <p className="text-gray-300 mb-4">{insight.description}</p>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-gray-400 mb-2">영향도:</p>
                      <p className="text-gray-200">{insight.impact}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-2">권장사항:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {insight.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 전략적 권장사항 */}
            {analysis.strategicRecommendations.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  전략적 권장사항
                </h3>
                <ul className="space-y-3">
                  {analysis.strategicRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-200">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 상세 통계 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 유입 경로 */}
          {analytics && analytics.referrers.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                유입 경로
              </h3>
              <div className="space-y-3">
                {analytics.referrers.slice(0, 10).map((ref, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm truncate flex-1">
                      {ref.referrer === 'direct' || !ref.referrer ? '직접 방문' : ref.referrer}
                    </span>
                    <span className="text-blue-400 font-bold ml-4">{ref.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 페이지 */}
          {analytics && analytics.topPages.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-green-400" />
                인기 페이지
              </h3>
              <div className="space-y-3">
                {analytics.topPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm truncate flex-1">{page.pagePath}</span>
                    <span className="text-green-400 font-bold ml-4">{page.viewCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 서비스 사용 통계 */}
          {analytics && analytics.serviceUsage.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                서비스 사용 통계
              </h3>
              <div className="space-y-4">
                {analytics.serviceUsage.map((service, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{service.serviceName}</span>
                      <span className="text-purple-400 font-bold">{service.usageCount.toLocaleString()}회</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(service.usageCount / analytics.serviceUsage[0].usageCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">평균 사용 시간: {service.avgDuration}초</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 디바이스 타입 */}
          {analytics && analytics.deviceTypes.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-yellow-400" />
                디바이스 유형
              </h3>
              <div className="space-y-4">
                {analytics.deviceTypes.map((device, index) => {
                  const total = analytics.deviceTypes.reduce((sum, d) => sum + d.count, 0);
                  const percentage = (device.count / total) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {device.deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-gray-300 capitalize">{device.deviceType}</span>
                        </div>
                        <span className="text-yellow-400 font-bold">
                          {device.count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 인기 블로그 포스트 */}
        {analytics && analytics.blogPostViews.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              가장 조회수 많은 블로그 포스트
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.blogPostViews.map((post, index) => (
                <Link
                  key={index}
                  href={`/blog/${post.postId}`}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                    <span className="text-blue-400 font-bold">{post.viewCount.toLocaleString()}회</span>
                  </div>
                  <h4 className="text-white font-semibold line-clamp-2 mb-2">{post.title}</h4>
                  <p className="text-xs text-gray-500">포스트 ID: {post.postId}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 시스템 상태 */}
        {stats && (
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Server className="w-6 h-6 text-green-400" />
              시스템 상태
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">핵심 서비스</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">포털 서버</span>
                    <span className={`font-bold ${getStatusColor(stats?.systemStatus?.server || 'unknown')}`}>
                      {(stats?.systemStatus?.server || 'unknown').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">MNPS 서비스</span>
                    <span className={`font-bold ${getStatusColor(stats?.systemStatus?.mnpsService || 'unknown')}`}>
                      {(stats?.systemStatus?.mnpsService || 'unknown').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Second Genesis</span>
                    <span className={`font-bold ${getStatusColor(stats?.systemStatus?.secondGenesisService || 'unknown')}`}>
                      {(stats?.systemStatus?.secondGenesisService || 'unknown').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">시스템 자원</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">데이터베이스</span>
                    <span className={`font-bold ${getStatusColor(stats?.systemStatus?.database || 'unknown')}`}>
                      {(stats?.systemStatus?.database || 'unknown').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">디스크 공간</span>
                    <span className={`font-bold ${getStatusColor(stats?.systemStatus?.diskSpace || 'unknown')}`}>
                      {(stats?.systemStatus?.diskSpace || 'unknown').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 기본 사용자 통계 */}
        {stats && (
          <section>
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              사용자 통계
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <Users className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-gray-400 text-sm mb-1">총 사용자</p>
                <p className="text-3xl font-bold">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <UserPlus className="w-8 h-8 text-green-400 mb-4" />
                <p className="text-gray-400 text-sm mb-1">오늘 가입</p>
                <p className="text-3xl font-bold">{(stats?.todaySignups ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
                <p className="text-gray-400 text-sm mb-1">이번 주 가입</p>
                <p className="text-3xl font-bold">{(stats?.weekSignups ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <Shield className="w-8 h-8 text-red-400 mb-4" />
                <p className="text-gray-400 text-sm mb-1">마스터 계정</p>
                <p className="text-3xl font-bold">{(stats?.masterAccounts ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
