/**
 * 블로그 포스트 이미지 업데이트 스크립트
 * 이미지 파일명을 기반으로 블로그 포스트에 이미지 경로를 자동 매칭합니다.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'mnps', 'mnps-service', 'blog.db');

if (!fs.existsSync(dbPath)) {
  console.error('블로그 데이터베이스를 찾을 수 없습니다:', dbPath);
  process.exit(1);
}

// 이미지 매칭 정보
const imageMapping = [
  {
    keywords: ['공감', '차가운', 'cold empathy'],
    postId: 8,
    imagePath: '/images/공감 능력의 결여.png'
  },
  {
    keywords: ['그림자', 'shadow', '칼 융', 'jung'],
    postId: 16,
    imagePath: '/images/그림자 통합.png'
  }
];

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
    process.exit(1);
  }

  console.log('\n=== 블로그 포스트 이미지 업데이트 시작 ===\n');

  // 각 매칭 정보에 대해 업데이트 수행
  let updateCount = 0;
  let processed = 0;

  imageMapping.forEach((mapping, index) => {
    // 먼저 포스트 확인
    db.get('SELECT id, title FROM posts WHERE id = ?', [mapping.postId], (err, post) => {
      if (err) {
        console.error(`포스트 ID ${mapping.postId} 조회 오류:`, err);
        processed++;
        checkComplete();
        return;
      }

      if (!post) {
        console.error(`❌ 포스트 ID ${mapping.postId}를 찾을 수 없습니다.`);
        processed++;
        checkComplete();
        return;
      }

      console.log(`📝 포스트 확인: "${post.title}" (ID: ${post.id})`);
      console.log(`   이미지 경로: ${mapping.imagePath}`);

      // 이미지 URL 업데이트
      db.run('UPDATE posts SET image = ? WHERE id = ?', [mapping.imagePath, mapping.postId], function(err) {
        if (err) {
          console.error(`❌ 이미지 업데이트 오류 (ID: ${mapping.postId}):`, err);
          processed++;
          checkComplete();
          return;
        }

        if (this.changes > 0) {
          console.log(`✅ 이미지가 성공적으로 업데이트되었습니다! (변경된 행 수: ${this.changes})\n`);
          updateCount++;
        } else {
          console.log(`⚠️  이미지가 업데이트되지 않았습니다. (변경된 행 수: 0)\n`);
        }

        processed++;
        checkComplete();
      });
    });
  });

  function checkComplete() {
    if (processed === imageMapping.length) {
      console.log(`\n=== 업데이트 완료 ===`);
      console.log(`총 ${updateCount}개의 포스트 이미지가 업데이트되었습니다.\n`);
      
      // 최종 확인
      db.all('SELECT id, title, image FROM posts WHERE id IN (?, ?)', [8, 16], (err, posts) => {
        if (err) {
          console.error('최종 확인 오류:', err);
        } else {
          console.log('=== 최종 확인 ===\n');
          posts.forEach(post => {
            console.log(`ID ${post.id}: ${post.title}`);
            console.log(`  이미지: ${post.image}\n`);
          });
        }
        db.close();
      });
    }
  }
});

