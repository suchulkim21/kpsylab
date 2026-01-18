/**
 * 블로그 포스트 이미지 경로 업데이트 (영어 파일명 사용)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'mnps', 'mnps-service', 'blog.db');

if (!fs.existsSync(dbPath)) {
  console.error('블로그 데이터베이스를 찾을 수 없습니다:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
    process.exit(1);
  }

  console.log('\n=== 블로그 포스트 이미지 경로 업데이트 ===\n');

  // 포스트 ID 8: 공감 능력의 결여
  db.run('UPDATE posts SET image = ? WHERE id = ?', ['/images/empathy-post-8.png', 8], function(err) {
    if (err) {
      console.error('포스트 8 업데이트 오류:', err);
    } else {
      console.log(`✅ 포스트 8 업데이트 완료 (변경된 행 수: ${this.changes})`);
    }

    // 포스트 ID 16: 그림자 통합
    db.run('UPDATE posts SET image = ? WHERE id = ?', ['/images/shadow-post-16.png', 16], function(err) {
      if (err) {
        console.error('포스트 16 업데이트 오류:', err);
      } else {
        console.log(`✅ 포스트 16 업데이트 완료 (변경된 행 수: ${this.changes})`);
      }

      // 최종 확인
      db.all('SELECT id, title, image FROM posts WHERE id IN (?, ?)', [8, 16], (err, posts) => {
        if (err) {
          console.error('최종 확인 오류:', err);
        } else {
          console.log('\n=== 최종 확인 ===\n');
          posts.forEach(post => {
            console.log(`ID ${post.id}: ${post.title}`);
            console.log(`  이미지: ${post.image}\n`);
          });
        }
        db.close();
      });
    });
  });
});

