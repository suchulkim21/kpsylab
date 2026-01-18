/**
 * Supabase blog_posts 이미지 경로를 로컬 경로로 통일
 * - /images/blog/topic_XXX.jpg 형식으로 정규화
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
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'blog');

function getLocalImages() {
  return fs
    .readdirSync(imagesDir)
    .filter((name) => name.startsWith('topic_') && name.endsWith('.jpg'))
    .sort();
}

async function normalizeBlogImages() {
  const localImages = getLocalImages();
  if (localImages.length === 0) {
    console.error('❌ 로컬 이미지가 없습니다:', imagesDir);
    process.exit(1);
  }

  const { data: rows, error } = await supabase
    .from('blog_posts')
    .select('id,title,image')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ blog_posts 조회 실패:', error.message);
    process.exit(1);
  }

  const toFix = [];
  for (const row of rows || []) {
    const img = String(row.image || '').trim();
    const isLocal = img.startsWith('/images/blog/');
    const fileName = isLocal ? img.replace('/images/blog/', '') : '';
    const exists = isLocal && localImages.includes(fileName);
    if (!isLocal || !exists) {
      const idx = ((row.id || 1) - 1) % localImages.length;
      const newImage = `/images/blog/${localImages[idx]}`;
      toFix.push({ id: row.id, image: newImage });
    }
  }

  console.log(`🖼️ 이미지 정규화 대상: ${toFix.length}개`);

  if (toFix.length === 0) {
    console.log('✅ 수정할 항목이 없습니다.');
    return;
  }

  let updated = 0;
  for (const item of toFix) {
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ image: item.image })
      .eq('id', item.id);
    if (updateError) {
      console.error(`❌ 이미지 업데이트 실패 (id=${item.id}):`, updateError.message);
      process.exit(1);
    }
    updated += 1;
  }

  console.log(`✅ 이미지 업데이트 완료: ${updated}개`);
}

normalizeBlogImages().catch((err) => {
  console.error('❌ 정규화 실패:', err);
  process.exit(1);
});
