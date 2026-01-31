import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';

// .env.local 로드
dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogPostIds() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, created_at')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ 오류:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('📭 블로그 포스트가 없습니다.');
      return;
    }

    console.log(`\n📊 총 ${posts.length}개 포스트 발견\n`);
    console.log('ID 범위:', {
      최소: posts[0].id,
      최대: posts[posts.length - 1].id,
      범위: `${posts[0].id} ~ ${posts[posts.length - 1].id}`
    });

    console.log('\n📝 처음 10개 포스트:');
    posts.slice(0, 10).forEach((post, index) => {
      console.log(`  ${index + 1}. ID: ${post.id} - ${post.title.substring(0, 50)}...`);
    });

    console.log('\n📝 마지막 10개 포스트:');
    posts.slice(-10).forEach((post, index) => {
      const actualIndex = posts.length - 10 + index;
      console.log(`  ${actualIndex + 1}. ID: ${post.id} - ${post.title.substring(0, 50)}...`);
    });

    // ID 113 확인
    const post113 = posts.find(p => p.id === 113);
    if (post113) {
      console.log('\n✅ ID 113 포스트 존재:', post113.title);
    } else {
      console.log('\n❌ ID 113 포스트가 없습니다.');
      console.log('   가능한 원인:');
      console.log('   1. 이전에 포스트가 삭제되어 ID가 건너뛰어졌을 수 있습니다.');
      console.log('   2. 데이터베이스 시퀀스가 113부터 시작했을 수 있습니다.');
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkBlogPostIds();
