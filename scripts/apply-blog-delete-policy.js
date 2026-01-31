/**
 * blog_posts 테이블에 DELETE 권한 추가 스크립트
 * Supabase RLS 정책을 수정하여 모든 사용자가 blog_posts를 삭제할 수 있도록 함
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY (또는 ANON_KEY)를 확인하세요.');
  process.exit(1);
}

// 서비스 키가 있으면 사용, 없으면 ANON_KEY 사용
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDeletePolicy() {
  try {
    console.log('📋 blog_posts 테이블 DELETE 정책 적용 중...');
    
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, '../lib/db/fix-blog-posts-delete-rls.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Supabase에서 직접 SQL 실행은 불가능하므로, 
    // RPC 함수를 사용하거나 Supabase 대시보드에서 실행해야 함
    // 여기서는 정책을 직접 생성하는 방법을 사용
    
    console.log('\n⚠️  Supabase에서는 JavaScript로 직접 RLS 정책을 생성할 수 없습니다.');
    console.log('   다음 방법 중 하나를 선택하세요:\n');
    
    console.log('📝 방법 1: Supabase 대시보드에서 SQL 실행 (권장)');
    console.log('   1. Supabase 대시보드 접속');
    console.log('   2. SQL Editor 열기');
    console.log('   3. 다음 SQL 실행:\n');
    console.log('   ' + '='.repeat(60));
    console.log(sql);
    console.log('   ' + '='.repeat(60));
    
    console.log('\n📝 방법 2: Supabase CLI 사용');
    console.log('   supabase db execute -f lib/db/fix-blog-posts-delete-rls.sql');
    
    console.log('\n📝 방법 3: 수동으로 정책 확인');
    console.log('   Supabase 대시보드 → Authentication → Policies');
    console.log('   blog_posts 테이블에 DELETE 정책이 있는지 확인');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

applyDeletePolicy();
