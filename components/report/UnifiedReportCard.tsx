"use client";

import { UnifiedReportData } from '@/types/report';

export default function UnifiedReportCard({ data }: { data: UnifiedReportData }) {
  const isPurple = data.theme === 'purple';
  const accentColor = isPurple ? 'text-purple-400' : 'text-cyan-400';
  const barColor = isPurple ? 'bg-purple-500' : 'bg-cyan-500';
  const borderAccent = isPurple ? 'border-purple-500/30' : 'border-cyan-500/30';
  const bgSoft = isPurple ? 'bg-purple-900/20' : 'bg-cyan-900/20';

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
      {/* 헤더: 모두 좌측 정렬 */}
      <div className="border-b border-gray-800 pb-6 mb-8 text-left">
        <span className={`report-section-label ${accentColor}`}>
          {data.moduleTitle}
        </span>
        <h2 className="report-section-title">
          {data.coreTypeTitle}
        </h2>
        <p className="report-section-summary">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 점수판: 좌측 정렬로 통일 */}
        <div className="report-card text-left">
          <span className="report-section-label block mb-2">주요 점수</span>
          <div className="text-6xl md:text-7xl font-black text-white tracking-tighter">
            {data.totalScore}
          </div>
          <span className={`text-sm mt-2 font-medium block ${accentColor}`}>
            KPSY LAB 분석
          </span>
        </div>

        {/* 차트 영역 */}
        <div className="report-card space-y-4">
          {data.chartData.map((item) => (
            <div key={item.label} className="text-left">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${Math.min(100, item.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 상세 텍스트: report-heading 스타일 */}
      <section className="text-left">
        <h3 className={`report-heading mb-4 ${isPurple ? 'border-purple-500' : 'border-cyan-500'}`} style={{ borderLeftColor: isPurple ? 'rgb(192 132 252)' : 'rgb(34 211 238)' }}>
          상세 분석
        </h3>
        <p className="report-body whitespace-pre-wrap">{data.detailText}</p>
      </section>

      {/* 조언/솔루션: report-card 스타일로 통일 */}
      {data.advice && (
        <div className={`mt-8 report-card ${bgSoft} ${borderAccent}`}>
          <h4 className={`report-heading mb-3 ${accentColor}`}>{data.advice.title}</h4>
          <ul className="space-y-2 text-left">
            {data.advice.todos.map((todo, idx) => (
              <li key={idx} className="flex items-start report-body text-sm">
                <span className={`mr-2 flex-shrink-0 ${accentColor}`}>•</span>
                <span>{todo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
