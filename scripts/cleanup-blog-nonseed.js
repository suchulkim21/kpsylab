/**
 * blog_seed.json에 없는 포스트 정리
 * - title 기준으로 seed에 없는 글 삭제
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const seedPath = path.join(__dirname, '..', 'lib', 'db', 'blog_seed.json');

function normalizeTitle(title) {
  return String(title || '').trim();
}

async function cleanupNonSeedPosts() {
  const seedRaw = fs.readFileSync(seedPath, 'utf8');
  const seedPosts = JSON.parse(seedRaw);
  const seedTitles = new Set(seedPosts.map(p => normalizeTitle(p.title)));

  const { data: existing, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id,title')
    .order('id', { ascending: false });

  if (fetchError) {
    console.error('❌ 기존 blog_posts 조회 실패:', fetchError.message);
    process.exit(1);
  }

  const toDelete = (existing || [])
    .filter(row => !seedTitles.has(normalizeTitle(row.title)))
    .map(row => row.id);

  console.log(`🧹 삭제 대상: ${toDelete.length}개`);

  if (toDelete.length === 0) {
    console.log('✅ 삭제할 항목이 없습니다.');
    return;
  }

  const batchSize = 50;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', batch);
    if (error) {
      console.error('❌ 삭제 실패:', error.message);
      process.exit(1);
    }
    deleted += batch.length;
  }

  console.log(`✅ 삭제 완료: ${deleted}개`);
}

cleanupNonSeedPosts().catch((err) => {
  console.error('❌ 정리 실패:', err);
  process.exit(1);
});
