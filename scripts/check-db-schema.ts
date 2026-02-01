/**
 * Supabase DB 스키마 점검 스크립트
 * visits, page_views, service_usage 테이블 인식 여부 확인
 *
 * 실행 (apps/portal 디렉터리에서):
 *   npm run check:db
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkTable(
  supabase: ReturnType<typeof createClient>,
  table: string,
  cols: string[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(table).select(cols.join(',')).limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function main() {
  console.log('=== Supabase DB 스키마 점검 ===\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 환경 변수 미설정');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '미설정');
    console.error('\n.env.local 또는 .env 파일에 Supabase 키를 설정한 뒤 실행하세요.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const tables = [
    { name: 'visits', cols: ['id', 'session_id', 'page_path', 'created_at'] },
    { name: 'page_views', cols: ['id', 'page_path', 'view_count', 'created_at'] },
    { name: 'service_usage', cols: ['id', 'service_name', 'created_at'] },
  ] as const;

  let allOk = true;
  for (const t of tables) {
    const res = await checkTable(supabase, t.name, t.cols);
    if (res.ok) {
      const { count } = await supabase.from(t.name).select('*', { count: 'exact', head: true });
      console.log(`✅ ${t.name}: 정상 인식 (레코드 수: ${count ?? '?'})`);
    } else {
      console.error(`❌ ${t.name}: 실패 - ${res.error}`);
      allOk = false;
    }
  }

  // visits INSERT 테스트 (선택)
  console.log('\n--- visits INSERT 테스트 ---');
  const { error: insertErr } = await supabase.from('visits').insert({
    session_id: `test_${Date.now()}`,
    page_path: '/check-db-schema',
    referrer: null,
    user_agent: 'check-db-schema',
    device_type: 'script',
  });
  if (insertErr) {
    console.error('❌ visits INSERT 실패:', insertErr.message);
    allOk = false;
  } else {
    console.log('✅ visits INSERT 정상');
  }

  console.log('\n--- RLS 정책 점검 ---');
  const { data: rlsCheck, error: rlsErr } = await supabase.from('visits').select('id').limit(1);
  if (rlsErr) {
    console.error('❌ visits SELECT (RLS) 실패:', rlsErr.message);
    allOk = false;
  } else {
    console.log('✅ visits SELECT (읽기) 정상');
  }

  console.log('\n=== 점검 완료 ===');
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error('스크립트 실행 오류:', e);
  process.exit(1);
});
