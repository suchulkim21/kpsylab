/**
 * 분석 데이터베이스 (Supabase)
 * KPSY LAB Portal
 */

import { supabase } from './supabase';

// 데이터베이스 초기화 (Supabase는 자동으로 테이블 생성)
export async function initAnalyticsDB(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  // 연결 테스트 (visits 테이블 존재 및 읽기 가능 여부)
  const { error } = await supabase.from('visits').select('id').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.warn('Supabase visits 테이블 확인:', error.message);
  }
}

// 접속 기록
export async function logVisit(data: {
  userId?: number;
  sessionId: string;
  pagePath: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
}): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { error } = await supabase.from('visits').insert({
    user_id: data.userId || null,
    session_id: data.sessionId,
    page_path: data.pagePath,
    referrer: data.referrer || null,
    user_agent: data.userAgent || null,
    ip_address: data.ipAddress || null,
    country: data.country || null,
    device_type: data.deviceType || null,
  });

  if (error) {
    console.error('방문 로그 기록 실패:', error);
  }
}

// 페이지 조회 기록
export async function logPageView(pagePath: string, pageType?: string, resourceId?: number): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 먼저 기존 레코드 확인
  const { data: existing } = await supabase
    .from('page_views')
    .select('*')
    .eq('page_path', pagePath)
    .eq('resource_id', resourceId || null)
    .single();

  if (existing) {
    // 기존 레코드 업데이트
    const { error } = await supabase
      .from('page_views')
      .update({
        view_count: existing.view_count + 1,
        last_viewed: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('페이지 조회 업데이트 실패:', error);
    }
  } else {
    // 새 레코드 생성
    const { error } = await supabase.from('page_views').insert({
      page_path: pagePath,
      page_type: pageType || null,
      resource_id: resourceId || null,
      view_count: 1,
      last_viewed: new Date().toISOString(),
    });

    if (error) {
      console.error('페이지 조회 기록 실패:', error);
    }
  }
}

// 서비스 사용 기록 (Supabase 미설정 또는 테이블 없으면 조용히 스킵)
export async function logServiceUsage(
  userId: number | null,
  serviceName: string,
  actionType?: string,
  durationSeconds?: number
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('service_usage').insert({
    user_id: userId || null,
    service_name: serviceName,
    action_type: actionType || null,
    duration_seconds: durationSeconds || null,
  });

  if (error) {
    console.error('서비스 사용 기록 실패:', error);
  }
}

// 통계 조회
export async function getAnalyticsStats(): Promise<{
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
}> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 총 접속 수
  const { count: totalVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true });

  // 오늘 접속 수
  const today = new Date().toISOString().split('T')[0];
  const { count: todayVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00.000Z`);

  // 오늘 고유 방문자 수
  const { data: uniqueToday } = await supabase
    .from('visits')
    .select('session_id')
    .gte('created_at', `${today}T00:00:00.000Z`);
  
  const uniqueVisitorsToday = new Set(uniqueToday?.map(v => v.session_id) || []).size;

  // 총 고유 방문자 수
  const { data: uniqueTotal } = await supabase
    .from('visits')
    .select('session_id');
  
  const uniqueVisitorsTotal = new Set(uniqueTotal?.map(v => v.session_id) || []).size;

  // 유입 경로
  const { data: referrersData } = await supabase
    .from('visits')
    .select('referrer')
    .not('referrer', 'is', null)
    .neq('referrer', '');

  const referrerCounts: Record<string, number> = {};
  referrersData?.forEach(r => {
    if (r.referrer) {
      referrerCounts[r.referrer] = (referrerCounts[r.referrer] || 0) + 1;
    }
  });

  const referrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 인기 페이지
  const { data: topPagesData } = await supabase
    .from('page_views')
    .select('page_path, page_type, view_count')
    .order('view_count', { ascending: false })
    .limit(10);

  const topPages = (topPagesData || []).map(p => ({
    pagePath: p.page_path,
    viewCount: p.view_count,
    pageType: p.page_type,
  }));

  // 서비스 사용 통계
  const { data: serviceUsageData } = await supabase
    .from('service_usage')
    .select('service_name, duration_seconds');

  const serviceUsageMap: Record<string, { count: number; totalDuration: number }> = {};
  serviceUsageData?.forEach(s => {
    if (!serviceUsageMap[s.service_name]) {
      serviceUsageMap[s.service_name] = { count: 0, totalDuration: 0 };
    }
    serviceUsageMap[s.service_name].count++;
    if (s.duration_seconds) {
      serviceUsageMap[s.service_name].totalDuration += s.duration_seconds;
    }
  });

  const serviceUsage = Object.entries(serviceUsageMap).map(([serviceName, stats]) => ({
    serviceName,
    usageCount: stats.count,
    avgDuration: stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0,
  }));

  // 블로그 포스트 조회수
  const { data: blogViewsData } = await supabase
    .from('page_views')
    .select('resource_id, page_path, view_count')
    .eq('page_type', 'blog')
    .not('resource_id', 'is', null)
    .order('view_count', { ascending: false })
    .limit(10);

  // 블로그 포스트 제목 가져오기
  const blogPostTitles: Record<number, string> = {};
  if (blogViewsData && blogViewsData.length > 0) {
    const postIds = blogViewsData.map(p => p.resource_id).filter(Boolean) as number[];
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, title')
      .in('id', postIds);

    blogPosts?.forEach(post => {
      blogPostTitles[post.id] = post.title;
    });
  }

  const blogPostViews = (blogViewsData || []).map(p => ({
    postId: p.resource_id as number,
    title: blogPostTitles[p.resource_id as number] || `포스트 #${p.resource_id}`,
    viewCount: p.view_count,
  }));

  // 디바이스 타입
  const { data: deviceData } = await supabase
    .from('visits')
    .select('device_type')
    .not('device_type', 'is', null);

  const deviceCounts: Record<string, number> = {};
  deviceData?.forEach(d => {
    const deviceType = d.device_type || 'Unknown';
    deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
  });

  const deviceTypes = Object.entries(deviceCounts)
    .map(([deviceType, count]) => ({ deviceType, count }))
    .sort((a, b) => b.count - a.count);

  // 일일 추이 (최근 7일)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { data: dailyData } = await supabase
    .from('visits')
    .select('created_at, session_id')
    .gte('created_at', weekAgo.toISOString());

  const dailyTrendMap: Record<string, { visits: number; uniqueVisitors: Set<string> }> = {};
  
  dailyData?.forEach(visit => {
    const date = new Date(visit.created_at).toISOString().split('T')[0];
    if (!dailyTrendMap[date]) {
      dailyTrendMap[date] = { visits: 0, uniqueVisitors: new Set() };
    }
    dailyTrendMap[date].visits++;
    dailyTrendMap[date].uniqueVisitors.add(visit.session_id);
  });

  const dailyTrend = Object.entries(dailyTrendMap)
    .map(([date, stats]) => ({
      date,
      visits: stats.visits,
      uniqueVisitors: stats.uniqueVisitors.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalVisits: totalVisits || 0,
    todayVisits: todayVisits || 0,
    uniqueVisitorsToday,
    uniqueVisitorsTotal,
    referrers,
    topPages,
    serviceUsage,
    blogPostViews,
    deviceTypes,
    dailyTrend,
  };
}

// 데이터베이스 초기화
initAnalyticsDB().catch(console.error);
