import * as fs from 'fs';
import * as path from 'path';

const CATEGORIES = {
    "마케팅 심리학": ["마케팅", "소비", "구매", "판매", "고객", "브랜드", "세일즈", "광고", "비즈니스", "수요", "행동경제학", "선택", "가격", "마케터", "트렌드"],
    "인지·뇌과학": ["뇌", "인지", "메타인지", "기억", "신경", "전두엽", "도파민", "가소성", "학습", "편도체", "신경학", "시냅스", "의사결정", "집중력"],
    "마음챙김·치유": ["우울", "불안", "스트레스", "트라우마", "치유", "명상", "감정", "상담", "CBT", "슬픔", "분노", "마음챙김", "수용", "위로", "상처", "번아웃", "강박"],
    "성장·자기계발": ["자아실현", "습관", "목표", "동기부여", "성취", "변화", "시간관리", "생산성", "성격", "잠재력", "도전", "성공", "의지력", "자존감"],
    "인간관계·사회": ["관계", "소통", "공감", "갈등", "대인관계", "사회", "타인", "소외", "집단", "의사소통", "가족", "연인", "소속감", "편견", "군중심리"]
};

// 메인 실행
async function main() {
    const postsDir = path.join(process.cwd(), 'docs', 'blog_posts_phase1');
    if (!fs.existsSync(postsDir)) {
        console.error("Posts directory not found:", postsDir);
        process.exit(1);
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const filePath = path.join(postsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // 태그 부분 추출 및 분석
        const tagsMatch = content.match(/## 태그\s*[\r\n]+([^\r\n]+)/);
        let currentTags = tagsMatch ? tagsMatch[1].trim().split(',').map(t => t.trim()) : [];

        // 이미 메인 카테고리가 있는지 확인하고 필터링
        const categoryNames = Object.keys(CATEGORIES);
        currentTags = currentTags.filter(t => !categoryNames.includes(t) && t !== '일반 심리학');

        const contentForMatch = content.toLowerCase();

        // 점수 계산
        const scores = {};
        for (const [cat, keywords] of Object.entries(CATEGORIES)) {
            scores[cat] = 0;
            for (const kw of keywords) {
                // 정규식으로 단어 등장이 얼마나 되는지 체크
                const regex = new RegExp(kw, 'gi');
                const matches = contentForMatch.match(regex);
                if (matches) {
                    scores[cat] += matches.length;
                }
            }
        }

        // 최고 점수 카테고리 선정
        let bestCat = "일반 심리학";
        let maxScore = 0;
        for (const [cat, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestCat = cat;
            }
        }

        // 새 태그 배열 (카테고리를 맨 앞에)
        const newTags = [bestCat, ...currentTags];
        const newTagsStr = Array.from(new Set(newTags)).join(", ");

        // 파일 내용 업데이트
        if (tagsMatch) {
            content = content.replace(/## 태그\s*[\r\n]+([^\r\n]+)/, `## 태그\n${newTagsStr}`);
        } else {
            console.warn(`${file}에 태그 섹션이 없습니다.`);
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`[${file}] -> ${bestCat} (score: ${maxScore})`);
    }

    console.log(`\n🎉 총 ${files.length}개 포스트의 카테고리 태그 분류를 완료했습니다!`);
}

main().catch(console.error);
