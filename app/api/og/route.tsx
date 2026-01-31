/**
 * MNPS 동적 OG 이미지 API (Edge)
 * Query: assessmentId → Supabase에서 archetype·percentile 조회 후 ImageResponse 반환
 */

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const HIGH_CUTOFF = 75;
const MID_CUTOFF = 45;
const ARCHETYPE_HIGH_CUTOFF = 70;

type TraitScores = {
  machiavellianism?: number;
  narcissism?: number;
  psychopathy?: number;
  sadism?: number;
};

function getArchetypeFromScores(traitScores: TraitScores): string {
  const m = Number(traitScores.machiavellianism) ?? 0;
  const n = Number(traitScores.narcissism) ?? 0;
  const p = Number(traitScores.psychopathy) ?? 0;
  const s = Number(traitScores.sadism) ?? 0;
  const high = (v: number) => v >= HIGH_CUTOFF;
  const mid = (v: number) => v >= MID_CUTOFF && v < HIGH_CUTOFF;
  const ordered = [
    { key: 'machiavellianism', value: m },
    { key: 'narcissism', value: n },
    { key: 'psychopathy', value: p },
    { key: 'sadism', value: s },
  ].sort((a, b) => b.value - a.value);
  const top1 = ordered[0];

  if (high(m) && high(n)) return 'The Puppet Master';
  if (high(p) && high(s)) return 'The Volatile Outlaw';
  if (high(s) && mid(p)) return 'The Silent Predator';
  if (high(n) && p >= 60) return 'The Mirror Egoist';
  if (top1.value >= ARCHETYPE_HIGH_CUTOFF) {
    switch (top1.key) {
      case 'machiavellianism': return 'Strategic Game Architect';
      case 'narcissism': return 'High-Impact Ego Architect';
      case 'psychopathy': return 'Cold Crisis Operator';
      case 'sadism': return 'Social Predator';
    }
  }
  return 'Mixed Strategic Profile';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return new Response('assessmentId required', { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
      return new Response('Database not configured', { status: 503 });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey ?? anonKey ?? '',
      { auth: { persistSession: false } }
    );

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, status, raw_d_total')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment || assessment.status !== 'COMPLETED') {
      return new Response('Not found', { status: 404 });
    }

    const { data: metadata, error: metaError } = await supabase
      .from('results_metadata')
      .select('result_snapshot, percentile_at_creation')
      .eq('assessment_id', assessmentId)
      .single();

    if (metaError || !metadata) {
      return new Response('Results not found', { status: 404 });
    }

    const snap = (metadata.result_snapshot ?? {}) as Record<string, unknown>;
    const traitScores = (snap.traitScores ?? {}) as TraitScores;
    const archetype =
      (typeof snap.archetype === 'string' && snap.archetype)
        ? snap.archetype
        : getArchetypeFromScores(traitScores);

    let percentile: number | null =
      metadata?.percentile_at_creation != null
        ? Number(metadata.percentile_at_creation)
        : null;
    if (percentile == null || Number.isNaN(percentile)) {
      percentile = null;
    }
    const topN = percentile != null ? (100 - percentile).toFixed(1) : null;
    const subText = topN != null ? `상위 ${topN}%의 위험한 본성` : 'Dark Nature Test';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 40%, #0d0d0d 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: '#fafafa',
                textAlign: 'center',
                maxWidth: 800,
                lineHeight: 1.2,
              }}
            >
              {archetype}
            </div>
            <div
              style={{
                display: 'flex',
                padding: '12px 24px',
                backgroundColor: '#7f1d1d',
                color: '#fecaca',
                borderRadius: 9999,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {subText}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              fontSize: 16,
              color: '#737373',
              fontWeight: 600,
            }}
          >
            MNPS: Dark Nature Test
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG image error:', e);
    return new Response('Internal error', { status: 500 });
  }
}
