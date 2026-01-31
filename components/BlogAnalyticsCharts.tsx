'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BlogAnalyticsChartsProps {
  dailyViews: Array<{ date: string; views: number }>;
  categoryDistribution: Record<string, number>;
  topCategories: Array<{ category: string; views: number; count: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function BlogAnalyticsCharts({
  dailyViews,
  categoryDistribution,
  topCategories,
}: BlogAnalyticsChartsProps) {
  // 일별 조회수 차트 데이터 포맷팅
  const dailyChartData = dailyViews.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    views: item.views,
  }));

  // 카테고리 분포 파이 차트 데이터
  const categoryPieData = Object.entries(categoryDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // 카테고리별 조회수 바 차트 데이터
  const categoryBarData = topCategories.slice(0, 10).map(cat => ({
    name: cat.category.length > 10 ? cat.category.substring(0, 10) + '...' : cat.category,
    views: cat.views,
    posts: cat.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 일별 조회수 추이 */}
      {dailyChartData.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">일별 조회수 추이 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                name="조회수"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 카테고리별 포스트 수 분포 */}
      {categoryPieData.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">카테고리별 포스트 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 카테고리별 조회수 */}
      {categoryBarData.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">카테고리별 조회수 TOP 10</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Bar dataKey="views" fill="#6366f1" name="조회수" />
              <Bar dataKey="posts" fill="#8b5cf6" name="포스트 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
