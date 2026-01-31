"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Skull } from "lucide-react";
import { scoreDarkNature, DarkAnswer, assembleReport } from "@/lib/mnps/darkNatureScoring";
import { parseMarkdown, renderHighlights } from "@/lib/utils/parseMarkdown";
import DisclaimerBanner from "./DisclaimerBanner";

// 서버 주도 채점: assessmentId가 있으면 반드시 API에서만 결과 로드. 없을 때만 sessionStorage fallback(미완료/오프라인)
async function getResult(assessmentId?: string | null) {
  // 1. assessmentId가 있을 때: API만 사용 (서버 저장 데이터만 신뢰)
  if (assessmentId) {
    try {
      const response = await fetch(`/api/mnps/results?assessmentId=${assessmentId}`);
      const data = await response.json();
      if (data.success && data.result) {
        const r = data.result;
        const radar = Array.isArray(r.radarChartData) ? r.radarChartData : [];
        const traitScores =
          r.traitScores && typeof r.traitScores === 'object'
            ? r.traitScores
            : radar.length >= 4
              ? {
                  machiavellianism: Number(radar[0]?.value) || 0,
                  narcissism: Number(radar[1]?.value) || 0,
                  psychopathy: Number(radar[2]?.value) || 0,
                  sadism: Number(radar[3]?.value) || 0,
                }
              : {};
        return {
          result: {
            dTotal: r.dTotal ?? 0,
            rawDTotal: r.rawDTotal,
            isExtremeTop: r.isExtremeTop,
            traitScores,
            subFactorScores: r.subFactorScores ?? {},
            analysisAccuracy: r.analysisAccuracy,
            responseTimePenalty: r.responseTimePenalty,
            insincereResponsePattern: r.insincereResponsePattern,
            percentileAtCreation: r.percentileAtCreation,
          },
          interpretation: { good: r.goodReport, bad: r.badReport },
          radarChartData: r.radarChartData ?? radar,
          isPaid: data.isPaid,
          assessmentId,
        };
      }
    } catch (error) {
      console.error('DB 결과 조회 실패:', error);
    }
    // assessmentId가 있는데 API 실패 시 결과 없음 (sessionStorage fallback 하지 않음)
    return null;
  }

  // 2. assessmentId 없을 때만 sessionStorage fallback (미리보기/오프라인)
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('darkNatureResult');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isPaid: false,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export default function MnpsResultClient() {
  const [hasPaid, setHasPaid] = useState(false);
  const [resultData, setResultData] = useState<{
    result: ReturnType<typeof scoreDarkNature>;
    answers?: DarkAnswer[];
    radarChartData?: any[];
    isPaid?: boolean;
    assessmentId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 결과 불러오기 (유료 결제 비활성화: PG 연동·session_id 처리 생략)
  useEffect(() => {
    async function loadResult() {
      const urlParams = new URLSearchParams(window.location.search);
      const assessmentId = urlParams.get('assessmentId');

      const data = await getResult(assessmentId);
      if (data) {
        setResultData(data);
        setHasPaid(data.isPaid || false);
      } else {
        window.location.href = '/mnps/test';
      }
      setLoading(false);
    }
    loadResult();
  }, []);

  // 베타 기간: 클릭 시 로컬 state만 갱신하여 블러 해제 (서버 is_paid 업데이트 없음)
  function handleUnlockClick() {
    setHasPaid(true);
  }

  if (loading || !resultData) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">결과를 불러오는 중...</p>
      </main>
    );
  }

  const { result } = resultData;
  if (!result || typeof result !== 'object') {
    window.location.href = '/mnps/test';
    return null;
  }
  const scores = result.traitScores ?? {};
  // 보안: isPaid 상태에 따라 Bad 콘텐츠 제어 (서버 측 검증 권장)
  const profile = assembleReport(result, hasPaid);

  // 레이더 차트 데이터 (undefined 방어)
  const radarData = [
    { trait: "마키아벨리즘", value: Number(scores.machiavellianism) || 0 },
    { trait: "나르시시즘", value: Number(scores.narcissism) || 0 },
    { trait: "사이코패시", value: Number(scores.psychopathy) || 0 },
    { trait: "사디즘", value: Number(scores.sadism) || 0 },
  ];

  const hasAssessmentId = Boolean(resultData?.assessmentId);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* sessionStorage 전용: assessmentId 없을 때 안내 */}
        {!hasAssessmentId && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/50 border border-amber-700/50 text-amber-200 text-sm">
            결과가 서버에 저장되지 않아 공유하거나 다시 볼 수 없습니다. 이 기기에서만 참고용으로 확인해 주세요.
          </div>
        )}

        {/* 1. 상단 요약 섹션 (공통) */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">
            종합 D 점수: {profile.totalDScore} / 100
            {result?.isExtremeTop && (
              <span className="ml-2 text-sm font-normal text-amber-400" title="원점수 100 초과">
                (극단)
              </span>
            )}
          </h1>
          <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-4">
            <div
              className="bg-red-600 h-full transition-all duration-500"
              style={{ width: `${profile.totalDScore}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 tracking-wide uppercase mb-3">
            아키타입: <span className="font-semibold text-zinc-100">{profile.archetype}</span>
          </p>
          {profile.headline && (
            <p className="text-sm text-zinc-300 italic max-w-2xl mx-auto">
              {profile.headline}
            </p>
          )}
          {profile.highlights && profile.highlights.length > 0 && (
            <div className="mt-6 max-w-2xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                핵심 특징
              </h3>
              {renderHighlights(profile.highlights)}
            </div>
          )}
          {result?.percentileAtCreation != null && (() => {
            const topPercent = Number((100 - Number(result.percentileAtCreation)).toFixed(1));
            const isTop10 = topPercent <= 10;
            const isBottom50 = topPercent >= 50;
            const badgeStyle = isTop10
              ? "border-red-500 bg-red-950/80 text-red-200 ring-1 ring-red-500/50"
              : isBottom50
                ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500/30"
                : "border-amber-500/60 bg-amber-950/50 text-amber-200 ring-1 ring-amber-500/30";
            return (
              <div className={`mt-4 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold ${badgeStyle}`}>
                당신은 <span className="mx-1 font-bold">{topPercent}%</span>의 위험군입니다
              </div>
            );
          })()}
          {(() => {
            const acc = result?.analysisAccuracy ?? 50;
            const colorClass =
              acc >= 90
                ? "text-emerald-400"
                : acc >= 75
                  ? "text-yellow-400"
                  : "text-rose-400";
            return (
              <>
                <p className={`text-xs mt-2 font-medium ${colorClass}`}>
                  분석 정확도: <span className="font-bold">{acc}%</span>
                </p>
                {result?.responseTimePenalty && (
                  <p className="text-xs mt-1 text-amber-400">
                    응답이 매우 빠름 — 분석 정확도에 반영됨
                  </p>
                )}
                {result?.insincereResponsePattern && (
                  <p className="text-xs mt-1 text-rose-400 font-medium">
                    불성실 응답 의심 — 동일/지그재그 패턴 감지, 참고용으로만 활용하세요
                  </p>
                )}
              </>
            );
          })()}
        </section>

        {/* 레이더 차트 */}
        <section className="bg-zinc-900 p-6 rounded-2xl mb-8 border border-zinc-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 text-center">
            다크 테트라드 프로필
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis
                  dataKey="trait"
                  stroke="#a1a1aa"
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis
                  stroke="#52525b"
                  tick={{ fontSize: 10 }}
                  angle={90}
                  domain={[0, 100]}
                />
                <Radar
                  name="어두운 특성"
                  dataKey="value"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. Good 버전 (무료 공개) – 긍정 해석 */}
        <section className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 p-6 rounded-2xl mb-8 border border-emerald-800/50 shadow-lg shadow-emerald-900/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-900/60 rounded-lg">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-300">
                엘리트 뷰
              </h2>
              <p className="text-xs text-emerald-400/70">당신의 강점을 엘리트 관점으로 해석합니다</p>
            </div>
          </div>
          <div className="text-zinc-300 text-sm leading-relaxed">
            {parseMarkdown(profile.goodReport)}
          </div>
        </section>

        {/* 3. Bad 버전 (유료/블러 처리) – 어두운 이면 */}
        <section
          className={`relative overflow-hidden rounded-2xl border transition-all duration-700 ${
            hasPaid
              ? "border-red-800/60 bg-gradient-to-br from-red-950/50 to-zinc-950 shadow-lg shadow-red-900/30"
              : "border-red-900/30 bg-gradient-to-br from-red-950/30 to-zinc-900"
          } p-6`}
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/60 rounded-lg">
                <Skull className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">
                  어두운 이면
                </h2>
                <p className="text-xs text-red-400/70">가공 없는 어두운 이면</p>
              </div>
            </div>
            <span className="text-xs bg-amber-900/80 text-amber-200 px-2 py-1 rounded font-medium">
              베타
            </span>
          </div>

          {/* Bad Teaser (항상 표시, blur 없음) */}
          <div className="mb-4 p-4 bg-red-950/30 rounded-xl border border-red-900/20">
            <div className="text-zinc-300 text-sm leading-relaxed">
              {parseMarkdown(profile.badTeaser)}
            </div>
          </div>

          {/* Full Bad Report (결제 후에만 표시) */}
          {profile.fullBadReport ? (
            <div
              className={`transition-all duration-700 ${
                hasPaid ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
              }`}
            >
              <div className="border-t border-red-900/30 pt-5 mt-2">
                <div className="text-zinc-400 text-sm leading-relaxed">
                  {parseMarkdown(profile.fullBadReport)}
                </div>
              </div>
            </div>
          ) : (
            /* 블러 처리된 영역 (결제 전) */
            <div
              className={`relative transition-all duration-700 ${
                !hasPaid
                  ? "filter blur-[10px] select-none pointer-events-none opacity-50"
                  : "opacity-0"
              }`}
            >
              <div className="border-t border-red-900/30 pt-4 mt-4">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  이 섹션은 결제 후에만 공개됩니다. 당신의 어두운 알고리즘이 어떻게 작동하는지,
                  그리고 최종적으로 어떤 시나리오로 이어질 수 있는지 확인하시겠습니까?
                </p>
                <div className="mt-4 p-4 bg-red-950/40 border border-red-800/50 rounded-lg">
                  <p className="text-red-400 font-bold text-sm">
                    최종 리스크 시나리오: 당신의 패턴이 지속되면 법적·사회적 리스크로 이어질
                    가능성이 높습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Overlay (베타: 클릭 시 로컬에서만 블러 해제, PG 미연동) */}
          {!hasPaid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[4px] rounded-2xl">
              <div className="p-3 bg-red-900/40 rounded-full mb-4">
                <Skull className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-white font-bold mb-4 text-center px-6 text-lg">
                당신의 이면에 숨겨진 <br />
                <span className="text-red-400">진짜 위험한 본성</span>을 확인하시겠습니까?
              </p>
              <button
                onClick={handleUnlockClick}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-red-900/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                베타 기간 무료 확인
              </button>
              <p className="text-xs text-zinc-400 mt-3">
                현재 베타 기간이라 무료로 전체 분석을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </section>

        {/* 4. 공유/저장 (assessmentId 있을 때만 표시) */}
        {hasPaid && hasAssessmentId && (
          <div className="mt-8 flex justify-center space-x-4 text-sm text-zinc-500">
            <button className="hover:text-white transition">PDF 저장</button>
            <button className="hover:text-white transition">
              결과 공유하기
            </button>
          </div>
        )}

        {/* 5. 면책 조항·법적 고지 (필수) */}
        <DisclaimerBanner />
      </div>
    </main>
  );
}
