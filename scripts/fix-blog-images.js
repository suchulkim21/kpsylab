const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'mnps', 'mnps-service', 'blog.db');

console.log('블로그 이미지 URL 수정 작업을 시작합니다...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('DB 연결 오류:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // 현재 이미지 URL 확인
    db.all('SELECT id, title, image FROM posts ORDER BY id', [], (err, rows) => {
        if (err) {
            console.error('조회 오류:', err);
            db.close();
            return;
        }

        console.log('=== 이미지 URL 수정 전 ===');
        rows.forEach(row => {
            console.log(`ID ${row.id}: ${row.image}`);
        });

        // 이미지 URL 수정 (w=800 -> w=1200)
        const updateStmt = db.prepare('UPDATE posts SET image = ? WHERE id = ?');
        let updated = 0;

        rows.forEach(row => {
            if (row.image && row.image.includes('w=')) {
                const newImage = row.image.replace(/w=\d+/, 'w=1200');
                updateStmt.run(newImage, row.id, (err) => {
                    if (err) {
                        console.error(`ID ${row.id} 수정 오류:`, err);
                    } else {
                        updated++;
                    }
                });
            }
        });

        updateStmt.finalize((err) => {
            if (err) {
                console.error('Finalize 오류:', err);
            }

            // 수정 결과 확인
            db.all('SELECT id, title, image FROM posts ORDER BY id', [], (err, updatedRows) => {
                if (err) {
                    console.error('재조회 오류:', err);
                } else {
                    console.log(`\n=== 이미지 URL 수정 완료 (${updated}개) ===`);
                    updatedRows.forEach(row => {
                        console.log(`ID ${row.id}: ${row.image}`);
                    });
                }
                db.close();
            });
        });
    });
});



