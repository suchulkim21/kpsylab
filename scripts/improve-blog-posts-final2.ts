import * as fs from 'fs';
import * as path from 'path';

// 파일 개선 함수
function improvePost(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // "그리고 그 ~이 당신을 ~로 이끌 것입니다" 패턴 교체
  const leadPattern1 = /그리고 그 ([^가]*?)가 당신을 ([^로]*?)로 이끌 것입니다/g;
  content = content.replace(leadPattern1, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 당신의 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 당신의 삶을 바꿀 것입니다`,
      `이 과정이 당신을 더 나은 곳으로 이끕니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 당신의 삶을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 당신을 성장시킵니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    modified = true;
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~를 만들어줄 것입니다" 패턴 교체
  const makePattern1 = /그리고 그 ([^가]*?)가 ([^를]*?)를 만들어줄 것입니다/g;
  content = content.replace(makePattern1, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 ${p2}을 바꿀 것입니다`,
      `이 과정이 더 나은 결과를 만듭니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 ${p2}을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 성장을 만듭니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    modified = true;
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~을 만들어줄 것입니다" 패턴 교체
  const makePattern2 = /그리고 그 ([^가]*?)가 ([^을]*?)을 만들어줄 것입니다/g;
  content = content.replace(makePattern2, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 ${p2}을 바꿀 것입니다`,
      `이 과정이 더 나은 결과를 만듭니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 ${p2}을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 성장을 만듭니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    modified = true;
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~을 만들어갑니다" 패턴 교체 (이미 변환된 것도 확인)
  const makePattern3 = /그리고 그 ([^가]*?)가 ([^을]*?)을 만들어갑니다/g;
  content = content.replace(makePattern3, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 ${p2}을 바꿀 것입니다`,
      `이 과정이 더 나은 결과를 만듭니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 ${p2}을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 성장을 만듭니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    modified = true;
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  if (modified) {
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
  if (improvePost(filePath)) {
    improved++;
    console.log(`✓ Improved: ${file}`);
  }
}

console.log(`\n완료: ${improved}개 파일 개선됨`);
