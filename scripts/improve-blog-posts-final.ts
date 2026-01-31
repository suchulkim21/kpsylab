import * as fs from 'fs';
import * as path from 'path';

// 대체 표현 목록
const replacements = {
  '기억하세요': [
    '명심하세요',
    '잊지 마세요',
    '항상 염두에 두세요',
    '이 점을 기억해두세요',
    '이것을 명심하세요',
    '마음에 새겨두세요',
    '항상 기억해두세요',
    '이 점을 잊지 마세요',
    '명심해두세요',
    '기억해두세요',
    '이 점을 명심하세요',
    '잊지 말고 기억하세요',
    '항상 명심하세요',
    '이 점을 마음에 새기세요',
    '기억에 남겨두세요',
    '이 점을 기억하세요',
    '명심해두시기 바랍니다',
    '이 점을 잊지 말고',
    '항상 이 점을 기억하세요',
    '마음에 새겨두시기 바랍니다'
  ],
  '그리고 그': [
    '이 과정이',
    '작은 실천이',
    '지속적인 노력이',
    '이것이',
    '이 과정이',
    '작은 변화가',
    '이 실천이',
    '지속하면',
    '이 노력이',
    '작은 시작이'
  ]
};

// 랜덤 선택 함수
function getRandomReplacement(key: string): string {
  const options = replacements[key as keyof typeof replacements];
  if (!options) return key;
  return options[Math.floor(Math.random() * options.length)];
}

// 파일 개선 함수
function improvePost(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // "기억하세요" 교체
  if (content.includes('기억하세요')) {
    const replacements_list = replacements['기억하세요'];
    const replacement = replacements_list[Math.floor(Math.random() * replacements_list.length)];
    content = content.replace(/기억하세요/g, replacement);
    modified = true;
  }

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
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~로 이끌 것입니다" (가 없는 경우)
  const leadPattern2 = /그리고 그 ([^가]*?)이 ([^로]*?)로 이끌 것입니다/g;
  content = content.replace(leadPattern2, (match, p1, p2) => {
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
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~로 이끌 것입니다" (당신을 없는 경우)
  const leadPattern3 = /그리고 그 ([^가]*?)가 ([^로]*?)로 이끌 것입니다/g;
  content = content.replace(leadPattern3, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 삶을 바꿀 것입니다`,
      `이 과정이 더 나은 곳으로 이끕니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 삶을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 성장을 만듭니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
  });

  // "그리고 그 ~이 ~로 이끌 것입니다" (가 없는 경우, 당신을 없는 경우)
  const leadPattern4 = /그리고 그 ([^가]*?)이 ([^로]*?)로 이끌 것입니다/g;
  content = content.replace(leadPattern4, (match, p1, p2) => {
    const replacements_list = [
      `이 과정이 ${p2}을 만들어갑니다`,
      `작은 실천이 큰 ${p2}을 만듭니다`,
      `지속적인 노력이 원하는 결과를 가져올 것입니다`,
      `이것이 삶을 바꿀 것입니다`,
      `이 과정이 더 나은 곳으로 이끕니다`,
      `작은 변화가 쌓여 큰 변화가 됩니다`,
      `이 실천이 삶을 풍요롭게 만듭니다`,
      `지속하면 원하는 결과를 얻을 수 있습니다`,
      `이 노력이 성장을 만듭니다`,
      `작은 시작이 큰 성과를 만듭니다`
    ];
    return replacements_list[Math.floor(Math.random() * replacements_list.length)];
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
  if (improvePost(filePath)) {
    improved++;
    console.log(`✓ Improved: ${file}`);
  }
}

console.log(`\n완료: ${improved}개 파일 개선됨`);
