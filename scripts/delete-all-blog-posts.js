/**
 * 모든 블로그 포스트 삭제 스크립트
 * Supabase에서 blog_posts 테이블의 모든 데이터를 삭제합니다.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL와 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllBlogPosts() {
  try {
    console.log('📋 현재 블로그 포스트 확인 중...');
    
    // 먼저 현재 포스트 목록 조회
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, created_at')
      .order('id', { ascending: false });

    if (fetchError) {
      console.error('❌ 블로그 포스트 조회 실패:', fetchError.message);
      if (fetchError.code === 'PGRST205' || fetchError.code === 'PGRST206') {
        console.log('✅ blog_posts 테이블이 없거나 비어있습니다.');
        return;
      }
      process.exit(1);
    }

    if (!posts || posts.length === 0) {
      console.log('✅ 삭제할 블로그 포스트가 없습니다.');
      return;
    }

    console.log(`\n📊 발견된 블로그 포스트: ${posts.length}개`);
    console.log('\n포스트 목록:');
    posts.forEach((post, index) => {
      console.log(`  ${index + 1}. [ID: ${post.id}] ${post.title || '(제목 없음)'} (${post.created_at || '날짜 없음'})`);
    });

    console.log('\n🗑️  모든 블로그 포스트 삭제 중...');
    
    // 각 포스트를 개별적으로 삭제 (RLS 정책 우회를 위해)
    const postIds = posts.map(p => p.id);
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const id of postIds) {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error(`  ❌ ID ${id} 삭제 실패:`, deleteError.message);
        failedCount++;
      } else {
        deletedCount++;
        if (deletedCount % 10 === 0) {
          process.stdout.write(`\r  진행 중... ${deletedCount}/${postIds.length} 삭제됨`);
        }
      }
    }
    
    console.log(`\n  ✅ ${deletedCount}개 삭제 완료`);
    if (failedCount > 0) {
      console.log(`  ⚠️  ${failedCount}개 삭제 실패`);
    }
    
    const deleteError = failedCount > 0 ? { message: `${failedCount}개 삭제 실패` } : null;

    if (deleteError) {
      console.error('❌ 블로그 포스트 삭제 실패:', deleteError.message);
      console.error('   에러 코드:', deleteError.code);
      process.exit(1);
    }

    console.log(`\n✅ 성공적으로 ${posts.length}개의 블로그 포스트를 삭제했습니다.`);

    // 삭제 확인
    const { data: remainingPosts, error: verifyError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (verifyError && verifyError.code !== 'PGRST205' && verifyError.code !== 'PGRST206') {
      console.warn('⚠️  삭제 확인 중 오류:', verifyError.message);
    } else if (!remainingPosts || remainingPosts.length === 0) {
      console.log('✅ 확인: 모든 블로그 포스트가 삭제되었습니다.');
    } else {
      console.warn('⚠️  일부 포스트가 남아있을 수 있습니다. 수동으로 확인해주세요.');
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error.message);
    process.exit(1);
  }
}

deleteAllBlogPosts();
