/**
 * Supabase 블로그 포스트 이미지 상태 확인 스크립트
 * KPSY LAB Portal
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogImages() {
  console.log('\n🔍 블로그 포스트 이미지 상태 확인...\n');

  try {
    // 모든 포스트 가져오기
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, image')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ 포스트 조회 실패:', fetchError.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️  블로그 포스트가 없습니다.');
      return;
    }

    console.log(`📋 총 ${posts.length}개의 포스트를 확인합니다.\n`);
    console.log('='.repeat(80));

    let hasImageCount = 0;
    let missingImageCount = 0;
    const missingPosts = [];

    // 각 포스트의 이미지 상태 확인
    for (const post of posts) {
      const hasImage = post.image && post.image.trim() !== '';
      const imageStatus = hasImage ? '✅' : '❌';
      
      console.log(`${imageStatus} [ID: ${post.id}] ${post.title}`);
      
      if (hasImage) {
        console.log(`   이미지 URL: ${post.image}`);
        hasImageCount++;
      } else {
        console.log(`   ⚠️  이미지 없음`);
        missingImageCount++;
        missingPosts.push(post);
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log(`\n📊 요약:`);
    console.log(`   ✅ 이미지 있음: ${hasImageCount}개`);
    console.log(`   ❌ 이미지 없음: ${missingImageCount}개`);
    console.log(`   총: ${posts.length}개`);

    if (missingImageCount > 0) {
      console.log(`\n⚠️  이미지가 없는 포스트:`);
      missingPosts.forEach(post => {
        console.log(`   - [ID: ${post.id}] ${post.title}`);
      });
      console.log(`\n💡 해결 방법: scripts/update-blog-images.js 실행`);
    } else {
      console.log(`\n✨ 모든 포스트에 이미지가 설정되어 있습니다!`);
    }

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

// 실행
checkBlogImages()
  .then(() => {
    console.log('\n작업 완료.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('예상치 못한 오류:', err);
    process.exit(1);
  });
