/**
 * 마스터 계정 생성 스크립트 (Supabase)
 * 아이디: 마스터
 * 비밀번호: 한국21@!
 * 
 * 사용법:
 * 1. .env.local에 Supabase 환경 변수 설정
 * 2. node scripts/create-master-account.js
 */

const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 다음을 추가하세요:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 비밀번호 해싱 (auth.ts와 동일한 방식)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function createMasterAccount() {
  try {
    console.log('🔐 마스터 계정 생성 중...\n');

    // 기존 계정 확인
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .or('username.eq.마스터,email.eq.master@kpsylab.com')
      .single();

    if (existingUser) {
      // 기존 계정을 마스터로 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashPassword('한국21@!'),
          role: 'master',
          email: 'master@kpsylab.com',
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
          username: '마스터',
          email: 'master@kpsylab.com',
          password_hash: hashPassword('한국21@!'),
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
