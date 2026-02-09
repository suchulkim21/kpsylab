'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Activity,
  RefreshCw,
  Eye,
  Globe,
  Clock,
  Plus,
} from 'lucide-react';
import BlogPostEditor from '@/components/BlogPostEditor';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';

interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsTotal: number;
  referrers: { referrer: string; count: number }[];
  serviceUsage: { serviceName: string; usageCount: number; avgDuration: number }[];
}

interface Stats {
  totalUsers: number;
  todaySignups: number;
  totalBlogPosts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [adminKey, setAdminKey] = useState('');
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [showPostEditor, setShowPostEditor] = useState(false);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('admin-key') || '';
    setAdminKey(storedKey);
    setAdminKeyInput(storedKey);
    if (storedKey) {
      fetchAllData(storedKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchAllData = async (keyOverride?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const keyToUse = keyOverride ?? adminKey;

      const statsResponse = await fetch('/api/admin/stats', {
        headers: keyToUse ? { 'x-admin-secret': keyToUse } : undefined,
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      } else if (statsResponse.status === 403) {
        setError('관리자 키가 유효하지 않습니다.');
        return;
      }

      const analyticsResponse = await fetch('/api/admin/analytics', {
        headers: keyToUse ? { 'x-admin-secret': keyToUse } : undefined,
      });
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  // 관리자 키 입력 화면
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-4">관리자 키 입력</h1>
          <p className="text-sm text-gray-400 mb-6">
            관리자 기능 접근을 위해 키가 필요합니다.
          </p>
          <input
            type="password"
            value={adminKeyInput}
            onChange={(e) => setAdminKeyInput(e.target.value)}
            placeholder="ADMIN_SECRET"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              const trimmed = adminKeyInput.trim();
              if (!trimmed) return;
              sessionStorage.setItem('admin-key', trimmed);
              setAdminKey(trimmed);
              fetchAllData(trimmed);
            }}
            className="mt-4 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
          >
            접근하기
          </button>
          <Link
            href="/admin/reset"
            className="mt-4 block text-sm text-gray-400 hover:text-gray-200 text-center transition-colors"
          >
            키를 잃어버렸나요?
          </Link>
        </div>
      </div>
    );
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error && !stats && !analytics) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl font-bold mb-4">오류 발생</div>
        <p className="text-gray-400 mb-8">{error}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => fetchAllData()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin-key');
              setAdminKey('');
              setAdminKeyInput('');
            }}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            관리자 키 변경
          </button>
        </div>
      </div>
    );
  }

  // 평균 체류 시간 계산
  const totalDuration = analytics?.serviceUsage.reduce((sum, s) => sum + (s.avgDuration * s.usageCount), 0) || 0;
  const totalUsage = analytics?.serviceUsage.reduce((sum, s) => sum + s.usageCount, 0) || 0;
  const avgDuration = totalUsage > 0 ? Math.round(totalDuration / totalUsage) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">관리자 대시보드</h1>
            <p className="text-gray-500 text-sm">
              마지막 업데이트: {lastRefresh.toLocaleTimeString('ko-KR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {BLOG_ENABLED && (
              <button
                onClick={() => setShowPostEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                새 포스트
              </button>
            )}
            <button
              onClick={() => fetchAllData()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>

        {/* 핵심 메트릭 카드 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/40 rounded-xl p-5">
            <Eye className="w-6 h-6 text-blue-400 mb-3" />
            <p className="text-gray-400 text-xs mb-1">누적 접속</p>
            <p className="text-2xl font-bold text-white">{(analytics?.totalVisits ?? 0).toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/40 rounded-xl p-5">
            <Activity className="w-6 h-6 text-green-400 mb-3" />
            <p className="text-gray-400 text-xs mb-1">오늘 접속</p>
            <p className="text-2xl font-bold text-white">{(analytics?.todayVisits ?? 0).toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/40 rounded-xl p-5">
            <Clock className="w-6 h-6 text-purple-400 mb-3" />
            <p className="text-gray-400 text-xs mb-1">평균 체류시간</p>
            <p className="text-2xl font-bold text-white">{avgDuration}초</p>
          </div>

          {BLOG_ENABLED && (
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-700/40 rounded-xl p-5">
              <FileText className="w-6 h-6 text-yellow-400 mb-3" />
              <p className="text-gray-400 text-xs mb-1">블로그 포스트</p>
              <p className="text-2xl font-bold text-white">{(stats?.totalBlogPosts ?? 0).toLocaleString()}</p>
            </div>
          )}
        </section>

        {/* 유입 경로 & 서비스별 체류시간 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 유입 경로 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              유입 경로
            </h3>
            {analytics?.referrers && analytics.referrers.length > 0 ? (
              <div className="space-y-3">
                {analytics.referrers.slice(0, 5).map((ref, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm truncate flex-1">
                      {ref.referrer === 'direct' || !ref.referrer ? '직접 방문' : ref.referrer}
                    </span>
                    <span className="text-blue-400 font-bold ml-4">{ref.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">아직 데이터가 없습니다</p>
            )}
          </div>

          {/* 서비스별 평균 체류시간 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              서비스별 체류시간
            </h3>
            {analytics?.serviceUsage && analytics.serviceUsage.length > 0 ? (
              <div className="space-y-3">
                {analytics.serviceUsage.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm capitalize">{service.serviceName}</span>
                    <div className="text-right">
                      <span className="text-purple-400 font-bold">{service.avgDuration}초</span>
                      <span className="text-gray-600 text-xs ml-2">({service.usageCount}회)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">아직 데이터가 없습니다</p>
            )}
          </div>
        </div>

        {/* 간단한 사용자 정보 */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            사용자 정보
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs">총 사용자</p>
              <p className="text-xl font-bold text-white">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">오늘 가입</p>
              <p className="text-xl font-bold text-white">{(stats?.todaySignups ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">고유 방문자 (오늘)</p>
              <p className="text-xl font-bold text-white">{(analytics?.uniqueVisitorsToday ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 블로그 포스트 에디터 */}
        {BLOG_ENABLED && showPostEditor && (
          <BlogPostEditor
            adminKey={adminKey}
            onSave={() => {
              setShowPostEditor(false);
              fetchAllData(adminKey);
            }}
            onCancel={() => setShowPostEditor(false)}
          />
        )}
      </div>
    </div>
  );
}
