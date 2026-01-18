/**
 * 종합 분석 엔진
 * 웹서비스 데이터를 분석하여 향후 방향을 제시
 */

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

export function analyzeServiceDirection(data: AnalyticsData): {
  insights: AnalysisInsight[];
  summary: string;
  keyMetrics: {
    growthRate: number;
    engagementRate: number;
    retentionRate: number;
  };
  strategicRecommendations: string[];
} {
  const insights: AnalysisInsight[] = [];

  // 1. 트래픽 분석
  const growthRate = data.dailyTrend.length > 1
    ? ((data.todayVisits - (data.dailyTrend[0]?.visits || 0)) / (data.dailyTrend[0]?.visits || 1)) * 100
    : 0;

  if (growthRate > 20) {
    insights.push({
      category: '트래픽 성장',
      title: '강한 성장세',
      description: `오늘 접속자 수가 전날 대비 ${growthRate.toFixed(1)}% 증가했습니다. 서비스에 대한 관심이 높아지고 있습니다.`,
      priority: 'high',
      recommendations: [
        '서버 용량 점검 및 확장 계획 수립',
        '콘텐츠 업데이트 주기 단축 고려',
        '사용자 피드백 수집 체계 구축',
      ],
      impact: '긍정적 - 지속적인 마케팅 노력 필요',
    });
  } else if (growthRate < -10) {
    insights.push({
      category: '트래픽 감소',
      title: '접속자 수 감소',
      description: `접속자 수가 감소하고 있습니다. 콘텐츠 업데이트나 마케팅 전략 재검토가 필요합니다.`,
      priority: 'high',
      recommendations: [
        'SEO 최적화 강화',
        '소셜 미디어 마케팅 활성화',
        '콘텐츠 다양화 및 업데이트',
        '사용자 참여 프로그램 도입',
      ],
      impact: '주의 필요 - 즉각적인 개선 조치 권장',
    });
  }

  // 2. 콘텐츠 분석
  if (data.blogPostViews.length > 0) {
    const topPost = data.blogPostViews[0];
    const totalBlogViews = data.blogPostViews.reduce((sum, p) => sum + p.viewCount, 0);
    const topPostShare = (topPost.viewCount / totalBlogViews) * 100;

    if (topPostShare > 30) {
      insights.push({
        category: '콘텐츠 집중도',
        title: '인기 포스트 집중',
        description: `"${topPost.title}" 포스트가 전체 블로그 조회수의 ${topPostShare.toFixed(1)}%를 차지합니다.`,
        priority: 'medium',
        recommendations: [
          `인기 포스트와 유사한 주제로 시리즈 콘텐츠 제작`,
          '인기 포스트를 SEO 최적화하여 검색 노출 강화',
          '관련 포스트 추천 시스템 강화',
        ],
        impact: '긍정적 - 특정 주제에 대한 수요가 높음',
      });
    }
  }

  // 3. 서비스 사용 패턴
  if (data.serviceUsage.length > 0) {
    const topService = data.serviceUsage[0];
    const totalUsage = data.serviceUsage.reduce((sum, s) => sum + s.usageCount, 0);
    const serviceShare = (topService.usageCount / totalUsage) * 100;

    insights.push({
      category: '서비스 사용',
      title: `"${topService.serviceName}" 서비스 선호도 높음`,
      description: `${topService.serviceName}가 전체 서비스 사용의 ${serviceShare.toFixed(1)}%를 차지하며, 평균 사용 시간은 ${topService.avgDuration}초입니다.`,
      priority: 'high',
      recommendations: [
        `${topService.serviceName} 기능 개선 및 고도화`,
        '유사한 사용 패턴을 가진 서비스와의 연계 강화',
        '서비스 사용 안내 및 튜토리얼 제공',
      ],
      impact: '긍정적 - 핵심 서비스로 집중 개발 권장',
    });
  }

  // 4. 유입 경로 분석
  if (data.referrers.length > 0) {
    const directTraffic = data.referrers.find(r => 
      r.referrer.includes('kpsylab.com') || r.referrer === 'direct' || !r.referrer
    );
    const externalTraffic = data.referrers.filter(r => 
      !r.referrer.includes('kpsylab.com') && r.referrer !== 'direct'
    );

    if (externalTraffic.length === 0 && data.referrers.length > 0) {
      insights.push({
        category: '유입 경로',
        title: '외부 유입 부족',
        description: '대부분의 트래픽이 직접 방문입니다. SEO 및 외부 마케팅 강화가 필요합니다.',
        priority: 'medium',
        recommendations: [
          '블로그 포스트 SEO 최적화',
          '소셜 미디어 공유 기능 강화',
          '파트너십 및 협업 마케팅 추진',
          '콘텐츠 마케팅 전략 수립',
        ],
        impact: '개선 필요 - 외부 유입 확대 필요',
      });
    }
  }

  // 5. 디바이스 분석
  if (data.deviceTypes.length > 0) {
    const mobileShare = data.deviceTypes
      .filter(d => d.deviceType === 'mobile')
      .reduce((sum, d) => sum + d.count, 0) / data.totalVisits * 100;

    if (mobileShare > 60) {
      insights.push({
        category: '모바일 우선',
        title: '모바일 트래픽 우세',
        description: `전체 트래픽의 ${mobileShare.toFixed(1)}%가 모바일에서 발생하고 있습니다.`,
        priority: 'high',
        recommendations: [
          '모바일 UI/UX 최적화 강화',
          '모바일 전용 기능 개발',
          'PWA(Progressive Web App) 도입 검토',
          '모바일 성능 최적화',
        ],
        impact: '긍정적 - 모바일 중심 개발 전략 필요',
      });
    }
  }

  // 6. 참여도 분석
  const engagementRate = data.uniqueVisitorsTotal > 0
    ? (data.totalVisits / data.uniqueVisitorsTotal)
    : 0;

  if (engagementRate < 1.5) {
    insights.push({
      category: '사용자 참여',
      title: '참여도 개선 필요',
      description: `사용자당 평균 ${engagementRate.toFixed(2)}회 방문으로 참여도가 낮습니다.`,
      priority: 'medium',
      recommendations: [
        '콘텐츠 업데이트 주기 단축',
        '개인화된 추천 시스템 도입',
        '이메일 알림 및 구독 기능 강화',
        '커뮤니티 기능 추가',
      ],
      impact: '개선 필요 - 재방문율 향상 필요',
    });
  }

  // 핵심 메트릭
  const keyMetrics = {
    growthRate: Math.round(growthRate),
    engagementRate: Math.round(engagementRate * 100) / 100,
    retentionRate: data.uniqueVisitorsTotal > 0
      ? Math.round((data.uniqueVisitorsToday / data.uniqueVisitorsTotal) * 100)
      : 0,
  };

  // 전략적 권장사항
  const strategicRecommendations: string[] = [];

  if (data.serviceUsage.length > 0) {
    const topService = data.serviceUsage[0];
    strategicRecommendations.push(
      `"${topService.serviceName}" 서비스에 집중하여 고도화 및 마케팅 강화`
    );
  }

  if (data.blogPostViews.length > 0) {
    const topPost = data.blogPostViews[0];
    strategicRecommendations.push(
      `인기 블로그 포스트 "${topPost.title}"와 유사한 콘텐츠 제작으로 트래픽 유지`
    );
  }

  if (engagementRate < 2) {
    strategicRecommendations.push(
      '사용자 재방문을 위한 콘텐츠 업데이트 주기 단축 및 알림 시스템 구축'
    );
  }

  if (growthRate > 0) {
    strategicRecommendations.push(
      '성장세를 유지하기 위한 서버 인프라 점검 및 확장 계획 수립'
    );
  }

  // 종합 요약
  const summary = `
    현재 서비스는 ${data.totalVisits}회의 누적 접속을 기록했으며, 오늘 ${data.todayVisits}회의 접속이 있었습니다. 
    ${data.uniqueVisitorsTotal}명의 고유 방문자가 있으며, 오늘 ${data.uniqueVisitorsToday}명이 방문했습니다.
    ${data.serviceUsage.length > 0 ? `가장 많이 사용되는 서비스는 "${data.serviceUsage[0].serviceName}"입니다.` : ''}
    ${data.blogPostViews.length > 0 ? `가장 인기 있는 블로그 포스트는 "${data.blogPostViews[0].title}"입니다.` : ''}
    ${growthRate > 0 ? `성장률은 ${growthRate.toFixed(1)}%로 긍정적인 추세를 보이고 있습니다.` : '성장률 개선이 필요합니다.'}
  `.trim();

  return {
    insights,
    summary,
    keyMetrics,
    strategicRecommendations,
  };
}

