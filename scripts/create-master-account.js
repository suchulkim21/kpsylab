/**
 * 마스터 계정 생성 스크립트 (Supabase)
 * 아이디: bbm21k@gamil.com
 * 비밀번호: gksrnr21@!
 *
 * 사용법:
 * 1. .env.local에 Supabase 환경 변수 설정
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY (필수)
 * 2. node scripts/create-master-account.js
 */

const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 다음을 추가하세요:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
  console.error('   users 테이블은 RLS로 보호되어 있어 anon 키로 쓰기 불가입니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// 비밀번호 해싱 (auth.ts와 동일한 방식)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function createMasterAccount() {
  try {
    console.log('🔐 마스터 계정 생성 중...\n');

    const masterUsername = 'bbm21k@gamil.com';
    const masterEmail = 'bbm21k@gamil.com';
    const masterPassword = 'gksrnr21@!';

    // 기존 계정 확인
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .or(`username.eq.${masterUsername},email.eq.${masterEmail}`)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ 기존 계정 조회 실패:', searchError.message);
      process.exit(1);
    }

    if (existingUser) {
      // 기존 계정을 마스터로 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashPassword(masterPassword),
          role: 'master',
          email: masterEmail,
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ 계정 업데이트 실패:', updateError.message);
        process.exit(1);
      }

      console.log('✅ 기존 계정이 마스터 계정으로 업데이트되었습니다.');
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
    } else {
      // 새 마스터 계정 생성
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: masterUsername,
          email: masterEmail,
          password_hash: hashPassword(masterPassword),
          role: 'master',
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ 계정 생성 실패:', insertError.message);
        process.exit(1);
      }

      console.log('✅ 마스터 계정이 생성되었습니다.');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Username: ${newUser.username}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
    }

    console.log('\n✅ 작업이 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

createMasterAccount();
