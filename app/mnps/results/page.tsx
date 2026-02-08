'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { EMPTY_STATE } from '@/lib/constants/copy';

const MNPS_SESSION_KEY = 'mnps_session_id';
const MNPS_RESULTS_LIST_KEY = 'mnps_results_list';

type ResultItem = { id: string; completedAt: string | null; totalDScore: number | null };

function readLocalResults(): ResultItem[] {
  if (typeof window === "undefined") return [];
  const parseList = (raw: string | null) => {
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as ResultItem[];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };
  const fromSession = parseList(sessionStorage.getItem(MNPS_RESULTS_LIST_KEY));
  if (fromSession.length > 0) {
    try {
      if (!localStorage.getItem(MNPS_RESULTS_LIST_KEY)) {
        localStorage.setItem(MNPS_RESULTS_LIST_KEY, JSON.stringify(fromSession));
      }
    } catch {
      // ignore
    }
    return fromSession;
  }
  return parseList(localStorage.getItem(MNPS_RESULTS_LIST_KEY));
}

export default function MnpsResultsListPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem(MNPS_SESSION_KEY) : null;
    setHasSession(!!sessionId);
    setApiError(null);

    if (!sessionId) {
      const localList = readLocalResults();
      if (localList.length > 0) setResults(localList);
      setLoading(false);
      return;
    }

    fetch(`/api/mnps/my-results?sessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 503) setApiError('서버 설정이 필요합니다. (DB 미연결 시 이전 결과 목록을 불러올 수 없습니다.)');
          else setApiError('목록을 불러오지 못했습니다.');
          return { success: false, results: [] };
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
        } else {
          const localList = readLocalResults();
          if (localList.length > 0) {
            setResults(localList);
            setApiError(null);
          }
        }
      })
      .catch(() => {
        setApiError('네트워크 오류로 목록을 불러오지 못했습니다.');
        const localList = readLocalResults();
        if (localList.length > 0) {
          setResults(localList);
          setApiError(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="page min-h-screen">
      <div className="page-container max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">이전 결과 보기</h1>
          <Link
            href="/mnps/test"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            테스트 다시 하기
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">목록을 불러오는 중입니다.</p>
          </div>
        ) : apiError ? (
          <div className="card p-8 text-center">
            <p className="text-amber-400 mb-2">{apiError}</p>
            <p className="text-gray-500 text-sm mb-6">
              같은 브라우저에서 MNPS 테스트를 완료하면 이전 결과가 여기에 표시됩니다.
            </p>
            <Link
              href="/mnps/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
            >
              MNPS 테스트로 이동
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : results.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {hasSession ? EMPTY_STATE.mnpsNoResults : EMPTY_STATE.mnpsNoResultsLocal}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              MNPS 테스트를 완료하면 여기서 이전 결과를 볼 수 있습니다.
            </p>
            <Link
              href="/mnps/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
            >
              MNPS 테스트 시작
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.id.startsWith('local-') ? `/mnps/result?localId=${encodeURIComponent(r.id)}` : `/mnps/result?assessmentId=${r.id}`}
                  className="flex items-center justify-between card p-4 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">
                        {formatDate(r.completedAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link href="/mnps/test" className="text-sm text-gray-500 hover:text-gray-400">
            ← MNPS 테스트로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
