/**
 * SQLite → Supabase 데이터 마이그레이션 스크립트
 * 
 * 사용법:
 * 1. Supabase 프로젝트 생성 및 스키마 적용 (lib/db/supabase-schema.sql)
 * 2. 환경 변수 설정 (.env.local):
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 * 3. 이 스크립트 실행: node scripts/migrate-sqlite-to-supabase.js
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase 클라이언트
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

// SQLite DB 경로
const dataDir = path.join(__dirname, '..', 'data');
const blogDbPath = path.join(__dirname, '..', '..', '..', 'apps', 'mnps', 'mnps-service', 'blog.db');

function getDb(dbPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbPath)) {
      reject(new Error(`데이터베이스 파일이 없습니다: ${dbPath}`));
      return;
    }
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbClose(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function migrateUsers() {
  console.log('\n📦 사용자 데이터 마이그레이션 시작...');
  const dbPath = path.join(dataDir, 'users.db');
  
  try {
    const db = await getDb(dbPath);
    const users = await dbAll(db, 'SELECT * FROM users');
    await dbClose(db);

    if (users.length === 0) {
      console.log('   ✓ 마이그레이션할 사용자 데이터가 없습니다.');
      return;
    }

    // Supabase에 삽입
    const { data, error } = await supabase
      .from('users')
      .upsert(
        users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          password_hash: u.password_hash,
          role: u.role || 'user',
          created_at: u.created_at,
          updated_at: u.updated_at || u.created_at,
        })),
        { onConflict: 'id' }
      )
      .select();

    if (error) {
      console.error('   ❌ 사용자 마이그레이션 실패:', error.message);
    } else {
      console.log(`   ✓ ${users.length}명의 사용자 마이그레이션 완료`);
    }
  } catch (err) {
    console.error('   ❌ 사용자 마이그레이션 오류:', err.message);
  }
}

async function migrateBlogPosts() {
  console.log('\n📝 블로그 포스트 마이그레이션 시작...');
  
  try {
    if (!fs.existsSync(blogDbPath)) {
      console.log('   ⚠ 블로그 DB 파일이 없습니다:', blogDbPath);
      return;
    }

    const db = await getDb(blogDbPath);
    const posts = await dbAll(db, 'SELECT * FROM posts ORDER BY id');
    await dbClose(db);

    if (posts.length === 0) {
      console.log('   ✓ 마이그레이션할 블로그 포스트가 없습니다.');
      return;
    }

    // Supabase에 이미 있는 포스트 ID 확인 (업데이트 권한 없이도 안전하게 삽입)
    const { data: existingIds, error: existingError } = await supabase
      .from('blog_posts')
      .select('id');

    if (existingError) {
      console.error('   ❌ 기존 포스트 조회 실패:', existingError.message);
      return;
    }

    const existingIdSet = new Set((existingIds || []).map(p => p.id));
    const newPosts = posts.filter(p => !existingIdSet.has(p.id));

    if (newPosts.length === 0) {
      console.log('   ✓ 추가할 블로그 포스트가 없습니다. (이미 모두 존재)');
      return;
    }

    // 배치로 삽입 (Supabase는 한 번에 최대 1000개)
    const batchSize = 100;
    for (let i = 0; i < newPosts.length; i += batchSize) {
      const batch = newPosts.slice(i, i + batchSize);

      const { error } = await supabase
        .from('blog_posts')
        .insert(
          batch.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            author: p.author || 'admin',
            date: p.date || new Date().toISOString().split('T')[0],
            tags: p.tags || null,
            image: p.image || null,
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || p.created_at || new Date().toISOString(),
          }))
        );

      if (error) {
        console.error(`   ❌ 배치 ${i + 1}-${Math.min(i + batchSize, newPosts.length)} 마이그레이션 실패:`, error.message);
      } else {
        console.log(`   ✓ 배치 ${i + 1}-${Math.min(i + batchSize, newPosts.length)}/${newPosts.length} 완료`);
      }
    }

    console.log(`   ✓ 총 ${newPosts.length}개의 블로그 포스트 추가 완료`);
  } catch (err) {
    console.error('   ❌ 블로그 포스트 마이그레이션 오류:', err.message);
  }
}

async function migrateAnalytics() {
  console.log('\n📊 분석 데이터 마이그레이션 시작...');
  const dbPath = path.join(dataDir, 'analytics.db');
  
  try {
    if (!fs.existsSync(dbPath)) {
      console.log('   ⚠ 분석 DB 파일이 없습니다.');
      return;
    }

    const db = await getDb(dbPath);

    // Visits 마이그레이션
    const visits = await dbAll(db, 'SELECT * FROM visits');
    if (visits.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < visits.length; i += batchSize) {
        const batch = visits.slice(i, i + batchSize);
        const { error } = await supabase
          .from('visits')
          .upsert(
            batch.map(v => ({
              id: v.id,
              user_id: v.user_id || null,
              session_id: v.session_id,
              page_path: v.page_path,
              referrer: v.referrer || null,
              user_agent: v.user_agent || null,
              ip_address: v.ip_address || null,
              country: v.country || null,
              device_type: v.device_type || null,
              created_at: v.created_at || new Date().toISOString(),
            })),
            { onConflict: 'id' }
          );

        if (!error) {
          console.log(`   ✓ Visits ${i + 1}-${Math.min(i + batchSize, visits.length)}/${visits.length}`);
        }
      }
      console.log(`   ✓ ${visits.length}개의 방문 기록 마이그레이션 완료`);
    }

    // Page Views 마이그레이션
    const pageViews = await dbAll(db, 'SELECT * FROM page_views');
    if (pageViews.length > 0) {
      const { error } = await supabase
        .from('page_views')
        .upsert(
          pageViews.map(pv => ({
            id: pv.id,
            page_path: pv.page_path,
            page_type: pv.page_type || null,
            resource_id: pv.resource_id || null,
            view_count: pv.view_count || 1,
            last_viewed: pv.last_viewed || new Date().toISOString(),
            created_at: pv.created_at || new Date().toISOString(),
          })),
          { onConflict: 'id' }
        );

      if (!error) {
        console.log(`   ✓ ${pageViews.length}개의 페이지 조회 기록 마이그레이션 완료`);
      }
    }

    // Service Usage 마이그레이션
    const serviceUsage = await dbAll(db, 'SELECT * FROM service_usage');
    if (serviceUsage.length > 0) {
      const { error } = await supabase
        .from('service_usage')
        .upsert(
          serviceUsage.map(su => ({
            id: su.id,
            user_id: su.user_id || null,
            service_name: su.service_name,
            action_type: su.action_type || null,
            duration_seconds: su.duration_seconds || null,
            created_at: su.created_at || new Date().toISOString(),
          })),
          { onConflict: 'id' }
        );

      if (!error) {
        console.log(`   ✓ ${serviceUsage.length}개의 서비스 사용 기록 마이그레이션 완료`);
      }
    }

    await dbClose(db);
  } catch (err) {
    console.error('   ❌ 분석 데이터 마이그레이션 오류:', err.message);
  }
}

async function main() {
  console.log('🚀 SQLite → Supabase 마이그레이션 시작\n');
  console.log('Supabase URL:', supabaseUrl);

  // 연결 확인 (users 테이블이 없어도 blog_posts로 확인)
  const { error: testError } = await supabase.from('blog_posts').select('id').limit(1);
  if (testError && testError.code !== 'PGRST116') {
    console.error('❌ Supabase 연결 실패:', testError.message);
    console.error('   스키마가 제대로 설정되었는지 확인하세요.');
    process.exit(1);
  }

  await migrateUsers();
  await migrateBlogPosts();
  await migrateAnalytics();

  console.log('\n✅ 마이그레이션 완료!\n');
}

main().catch(console.error);

