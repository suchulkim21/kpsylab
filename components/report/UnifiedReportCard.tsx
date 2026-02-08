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

/** **bold** 구간을 <strong>으로 렌더링한 한 줄 */
function renderLineWithBold(line: string, keyPrefix: string) {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const re = /\*\*(.*?)\*\*/g;
  let match;
  let i = 0;
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`${keyPrefix}-b-${i}`} className="text-white font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

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
          <p className="text-center text-xs text-gray-400 mb-6 px-2 italic">
            이 리포트는 당신의 정답이 아닌, 당신이 참고할 수 있는 정교한 한 장의 지도입니다.
          </p>
          <div className="text-center mb-8">
            {data.syncPercentage != null && (
              <p className="text-sm text-emerald-400/90 mb-3">
                현재 모듈 간 일치도는 <strong className="text-white">{Math.round(Number(data.syncPercentage) || 0)}%</strong>입니다
              </p>
            )}
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
            <div className="w-full h-[200px] flex items-center justify-center">
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
                          <span className="text-white font-bold">{typeof item.value === 'number' ? Math.round(item.value) : item.value}</span>
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

          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className={`w-1 h-5 ${accentBg} rounded-full mr-3`}></span>
              심층 분석 리포트
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 leading-7 text-base break-keep">
              {data.detailText && data.detailText.trim()
                ? data.detailText.split('\n').filter((line) => line.trim()).map((line, i) => {
                    const trimmed = line.trim();
                    const isSectionTitle = /^\*\*\[/.test(trimmed);
                    return isSectionTitle ? (
                      <h4 key={i} className={`mt-8 mb-3 text-base font-bold ${data.theme === 'purple' ? 'text-purple-300' : 'text-cyan-300'}`}>
                        {renderLineWithBold(trimmed, `detail-${i}`)}
                      </h4>
                    ) : (
                      <p key={i} className="mb-4">{renderLineWithBold(trimmed, `detail-${i}`)}</p>
                    );
                  })
                : <p className="text-gray-400 italic">분석 내용을 불러오는 중이거나 표시할 본문이 없습니다. 1·2·3단계를 모두 완료한 뒤 최종 리포트를 다시 열어 주세요.</p>
              }
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
                {data.advice.todos.map((todo, idx) => {
                  const match = /^(미션|로드맵|확언|질문):\s*(.*)$/.exec(todo);
                  if (match) {
                    return (
                      <li key={idx} className="flex items-start text-gray-300 text-sm leading-relaxed">
                        <span className={`mr-2 font-semibold ${accentText} flex-shrink-0`}>{match[1]}:</span>
                        <span>{match[2]}</span>
                      </li>
                    );
                  }
                  return (
                    <li key={idx} className="flex items-start text-gray-300 text-sm leading-relaxed">
                      <span className={`mr-3 mt-1.5 w-1.5 h-1.5 rounded-full ${accentBg} flex-shrink-0`}></span>
                      {todo}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-sm mb-4 italic">
              이 결과는 당신의 고정된 운명이 아닙니다. 당신의 시스템을 더 나은 방향으로 재설계하기 위한 기초 지도입니다.
            </p>
            <p className="text-gray-400 text-xs tracking-widest uppercase">
              심리 분석 · <span className="text-white font-bold">KPSY LAB</span>
            </p>
            <p className="text-gray-500 text-[10px] mt-1">kpsylab.com</p>
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
        <p className="text-gray-400 text-xs">
          * 이미지를 저장하여 SNS에 공유해보세요.
        </p>
      </div>
    </div>
  );
}
