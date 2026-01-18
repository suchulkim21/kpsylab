/**
 * blog_seed.json을 Supabase blog_posts에 동기화
 * - title 기준으로 기존 레코드 업데이트
 * - 없는 title은 신규 삽입
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '미설정');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const seedPath = path.join(__dirname, '..', 'lib', 'db', 'blog_seed.json');

function normalizeTitle(title) {
  return String(title || '').trim();
}

async function syncBlogSeed() {
  const raw = fs.readFileSync(seedPath, 'utf8');
  const seedPosts = JSON.parse(raw);

  console.log(`📝 blog_seed.json 로드: ${seedPosts.length}개`);

  // 기존 데이터 조회
  const { data: existing, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id,title')
    .order('id', { ascending: false });

  if (fetchError) {
    console.error('❌ 기존 blog_posts 조회 실패:', fetchError.message);
    process.exit(1);
  }

  // title 기준 최신 id 맵
  const titleToId = new Map();
  for (const row of existing || []) {
    const key = normalizeTitle(row.title);
    if (!key) continue;
    if (!titleToId.has(key)) {
      titleToId.set(key, row.id);
    }
  }

  const toInsert = [];
  const toUpdate = [];

  // 현재 최대 id 조회 (시퀀스 꼬임 대비)
  const maxId = (existing || []).reduce((acc, row) => {
    return row.id > acc ? row.id : acc;
  }, 0);

  for (const post of seedPosts) {
    const key = normalizeTitle(post.title);
    if (!key) continue;

    const payload = {
      title: post.title,
      content: post.content,
      author: post.author,
      date: post.date,
      tags: post.tags,
      image: post.image || '',
    };

    const existingId = titleToId.get(key);
    if (existingId) {
      toUpdate.push({ id: existingId, payload });
    } else {
      toInsert.push(payload);
    }
  }

  console.log(`🔁 업데이트 대상: ${toUpdate.length}개`);
  console.log(`➕ 신규 삽입 대상: ${toInsert.length}개`);

  // 업데이트 (순차 처리)
  let updated = 0;
  for (const item of toUpdate) {
    const { error } = await supabase
      .from('blog_posts')
      .update(item.payload)
      .eq('id', item.id);
    if (error) {
      console.error(`❌ 업데이트 실패 (id=${item.id}):`, error.message);
      process.exit(1);
    }
    updated += 1;
  }

  // 삽입 (배치 처리, id 명시)
  let inserted = 0;
  const batchSize = 50;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize).map((row, idx) => ({
      id: maxId + i + idx + 1,
      ...row,
    }));
    const { error } = await supabase.from('blog_posts').insert(batch);
    if (error) {
      console.error('❌ 삽입 실패:', error.message);
      process.exit(1);
    }
    inserted += batch.length;
  }

  console.log(`✅ 업데이트 완료: ${updated}개`);
  console.log(`✅ 신규 삽입 완료: ${inserted}개`);
}

syncBlogSeed().catch((err) => {
  console.error('❌ 동기화 실패:', err);
  process.exit(1);
});
