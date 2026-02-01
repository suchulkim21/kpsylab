'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { UnifiedReportData } from '@/types/report';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

export default function UnifiedReportCard({ data }: { data: UnifiedReportData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isPurple = data.theme === 'purple';
  const accentText = isPurple ? 'text-purple-400' : 'text-cyan-400';
  const accentBg = isPurple ? 'bg-purple-500' : 'bg-cyan-500';
  const accentBorder = isPurple ? 'border-purple-500/30' : 'border-cyan-500/30';
  const softBg = isPurple ? 'bg-purple-900/10' : 'bg-cyan-900/10';
  const buttonHover = isPurple ? 'hover:bg-purple-600' : 'hover:bg-cyan-600';

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f1115',
        scale: 2,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `KPSY_LAB_${data.coreTypeTitle}.png`;
      link.click();
    } catch (err) {
      console.error('이미지 저장 실패:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-10 px-4">
      <div ref={cardRef} className="bg-[#0f1115] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className={`h-1 w-full ${accentBg}`} />
        <div className="p-6 md:p-10">
          <div className="text-center mb-8">
            <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold tracking-wider uppercase bg-gray-900 border border-gray-700 ${accentText} mb-4`}>
              {data.moduleTitle}
            </span>
            {data.rarityBadge && (
              <p className="mb-3 text-sm font-bold text-amber-400/90 border border-amber-500/40 rounded-full px-4 py-1.5 inline-block">
                ✦ {data.rarityBadge}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {data.coreTypeTitle}
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed break-keep">
              {data.summary}
            </p>
            {data.journeySummary && (
              <p className="mt-3 text-sm text-emerald-400/90 max-w-xl mx-auto leading-relaxed italic">
                {data.journeySummary}
              </p>
            )}
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-800">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-6 w-full">
                <span className="text-gray-500 text-sm font-medium block mb-2">종합 진단 점수</span>
                <div className="text-6xl font-black text-white tracking-tight">
                  {data.totalScore}
                  <span className="text-2xl text-gray-600 font-normal">/100</span>
                </div>
                <div className={`mt-2 text-sm font-medium ${accentText}`}>
                  상위 {Math.max(1, 100 - data.totalScore)}% 수준
                </div>
              </div>

              <div className="flex-1 w-full h-[200px] flex items-center justify-center">
                {data.chartData.length > 4 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.chartData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke={isPurple ? '#a855f7' : '#06b6d4'}
                        fill={isPurple ? '#a855f7' : '#06b6d4'}
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full space-y-3">
                    {data.chartData.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{item.label}</span>
                          <span className="text-white font-bold">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${accentBg}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className={`w-1 h-5 ${accentBg} rounded-full mr-3`}></span>
              심층 분석 리포트
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 leading-7 text-base break-keep">
              {data.detailText.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>
          </div>

          {data.conflictInsight && (
            <div className="mb-8 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <h4 className="text-sm font-bold text-amber-300 mb-2 flex items-center">
                <span className="mr-2">◈</span> 통합 관점: 심리적 역동
              </h4>
              <p className="text-amber-100/90 text-sm leading-relaxed break-keep">
                {data.conflictInsight}
              </p>
            </div>
          )}

          {data.scriptureLog && (
            <div className="mb-8 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-sm font-bold text-emerald-300 mb-2 flex items-center">
                <span className="mr-2">✦</span> 나만의 심리 지도
              </h4>
              <p className="text-emerald-100/90 text-sm leading-relaxed break-keep">
                {data.scriptureLog}
              </p>
            </div>
          )}

          {data.advice && (
            <div className={`rounded-2xl p-6 ${softBg} border ${accentBorder}`}>
              <h4 className={`font-bold mb-4 flex items-center ${accentText}`}>
                💡 실행 가이드: {data.advice.title}
              </h4>
              <ul className="space-y-3">
                {data.advice.todos.map((todo, idx) => (
                  <li key={idx} className="flex items-start text-gray-300 text-sm leading-relaxed">
                    <span className={`mr-3 mt-1.5 w-1.5 h-1.5 rounded-full ${accentBg} flex-shrink-0`}></span>
                    {todo}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-xs tracking-widest uppercase">
              Psychological Analysis by <span className="text-white font-bold">KPSY LAB</span>
            </p>
            <p className="text-gray-600 text-[10px] mt-1">kpsylab.com</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center space-y-4">
        <button
          onClick={handleSaveImage}
          disabled={isSaving}
          className={`
            w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
            ${accentBg} ${buttonHover} disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center mx-auto gap-2
          `}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              이미지 생성 중...
            </>
          ) : (
            <>
              📸 결과 이미지로 저장하기
            </>
          )}
        </button>
        <p className="text-gray-500 text-xs">
          * 이미지를 저장하여 SNS에 공유해보세요.
        </p>
      </div>
    </div>
  );
}
