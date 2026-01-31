import * as fs from 'fs';
import * as path from 'path';

// 파일 개선 함수
function improvePost(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // "그리고 그 ~이/가 ~를/을 만들어줄 것입니다" 패턴 교체
  const patterns = [
    // "그리고 그 ~가 ~를 만들어줄 것입니다"
    /그리고 그 ([^가]*?)가 ([^를]*?)를 만들어줄 것입니다/g,
    // "그리고 그 ~가 ~을 만들어줄 것입니다"
    /그리고 그 ([^가]*?)가 ([^을]*?)을 만들어줄 것입니다/g,
    // "그리고 그 ~이 ~를 만들어줄 것입니다"
    /그리고 그 ([^가]*?)이 ([^를]*?)를 만들어줄 것입니다/g,
    // "그리고 그 ~이 ~을 만들어줄 것입니다"
    /그리고 그 ([^가]*?)이 ([^을]*?)을 만들어줄 것입니다/g,
    // "그리고 그 ~가 ~을 만들어갑니다" (이미 변환된 것)
    /그리고 그 ([^가]*?)가 ([^을]*?)을 만들어갑니다/g,
    // "그리고 그 ~이 ~을 만들어갑니다"
    /그리고 그 ([^가]*?)이 ([^을]*?)을 만들어갑니다/g,
  ];

  const replacements = [
    '이 과정이 $2을 만들어갑니다',
    '작은 실천이 큰 $2을 만듭니다',
    '지속적인 노력이 원하는 결과를 가져올 것입니다',
    '이것이 $2을 바꿀 것입니다',
    '이 과정이 더 나은 결과를 만듭니다',
    '작은 변화가 쌓여 큰 변화가 됩니다',
    '이 실천이 $2을 풍요롭게 만듭니다',
    '지속하면 원하는 결과를 얻을 수 있습니다',
    '이 노력이 성장을 만듭니다',
    '작은 시작이 큰 성과를 만듭니다'
  ];

  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, (match) => {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        // $2를 실제 내용으로 대체하기 위해 더 정교한 처리 필요
        // 일단 간단하게 처리
        return replacement.replace(/\$2/g, '당신의 삶');
      });
      modified = true;
    }
  }

  // 더 정교한 패턴 매칭
  content = content.replace(/그리고 그 ([^가]*?)가 ([^를]*?)를 만들어줄 것입니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  content = content.replace(/그리고 그 ([^가]*?)가 ([^을]*?)을 만들어줄 것입니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  content = content.replace(/그리고 그 ([^가]*?)이 ([^를]*?)를 만들어줄 것입니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  content = content.replace(/그리고 그 ([^가]*?)이 ([^을]*?)을 만들어줄 것입니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  content = content.replace(/그리고 그 ([^가]*?)가 ([^을]*?)을 만들어갑니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  content = content.replace(/그리고 그 ([^가]*?)이 ([^을]*?)을 만들어갑니다/g, (match, p1, p2) => {
    const replacement = replacements[Math.floor(Math.random() * replacements.length)];
    return replacement.replace(/\$2/g, p2);
  });

  if (modified || content !== fs.readFileSync(filePath, 'utf-8')) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// 메인 실행
const postsDir = path.join(process.cwd(), 'docs', 'blog_posts_phase1');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).sort();

let improved = 0;
for (const file of files) {
  const filePath = path.join(postsDir, file);
  const before = fs.readFileSync(filePath, 'utf-8');
  if (improvePost(filePath)) {
    improved++;
    console.log(`✓ Improved: ${file}`);
  }
}

console.log(`\n완료: ${improved}개 파일 개선됨`);
