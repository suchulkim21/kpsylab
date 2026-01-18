const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'mnps', 'mnps-service', 'blog.db');

console.log('블로그 포스트 유사도 테스트를 시작합니다...\n');

// HTML 태그 제거
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Jaccard 유사도 계산
function calculateSimilarity(text1, text2) {
    const clean1 = stripHtml(text1).toLowerCase();
    const clean2 = stripHtml(text2).toLowerCase();
    
    const words1 = new Set(clean1.split(/\s+/).filter(w => w.length > 1));
    const words2 = new Set(clean2.split(/\s+/).filter(w => w.length > 1));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('DB 연결 오류:', err.message);
        process.exit(1);
    }
});

db.all('SELECT id, title, content FROM posts ORDER BY id', [], (err, rows) => {
    if (err) {
        console.error('조회 오류:', err);
        db.close();
        return;
    }

    console.log(`총 ${rows.length}개 포스트 분석 중...\n`);
    
    // 모든 포스트 길이 확인
    console.log('=== 포스트 길이 분석 ===');
    rows.forEach(row => {
        const textLength = stripHtml(row.content).length;
        console.log(`ID ${row.id}: ${row.title} - ${textLength}자`);
    });
    
    // 유사도 계산
    console.log('\n=== 유사도 테스트 (20% 초과 항목) ===');
    let highSimilarityCount = 0;
    const similarityResults = [];
    
    for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
            const similarity = calculateSimilarity(rows[i].content, rows[j].content);
            
            if (similarity > 20) {
                highSimilarityCount++;
                const result = {
                    post1: `ID ${rows[i].id}: ${rows[i].title}`,
                    post2: `ID ${rows[j].id}: ${rows[j].title}`,
                    similarity: similarity.toFixed(2)
                };
                similarityResults.push(result);
                console.log(`${result.post1}`);
                console.log(`  ↔ ${result.post2}`);
                console.log(`  유사도: ${result.similarity}%\n`);
            }
        }
    }
    
    console.log(`\n=== 요약 ===`);
    console.log(`총 비교 횟수: ${(rows.length * (rows.length - 1)) / 2}쌍`);
    console.log(`20% 초과 항목: ${highSimilarityCount}쌍`);
    console.log(`평균 포스트 길이: ${Math.round(rows.reduce((sum, row) => sum + stripHtml(row.content).length, 0) / rows.length)}자`);
    
    if (highSimilarityCount === 0) {
        console.log('\n✓ 모든 포스트의 유사도가 20% 이하입니다!');
    } else {
        console.log(`\n⚠ ${highSimilarityCount}쌍의 포스트가 20% 이상의 유사도를 가집니다.`);
        console.log('내용을 더 차별화해야 합니다.');
    }
    
    db.close();
});



