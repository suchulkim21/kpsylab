/**
 * Supabase 블로그 포스트 이미지 업데이트 스크립트 (로컬 이미지 사용)
 * KPSY LAB Portal
 * 
 * 이 스크립트는 public/images/ 폴더의 로컬 이미지 파일을 사용합니다.
 * 외부 URL 대신 로컬 파일 경로를 Supabase에 저장합니다.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '미설정');
  process.exit(1);
}

console.log('✅ 환경 변수 로드 완료');

const supabase = createClient(supabaseUrl, supabaseKey);

// public/images 폴더 경로
const imagesDir = path.join(__dirname, '..', 'public', 'images');

// 각 포스트에 맞는 로컬 이미지 파일 매핑
// 파일명만 지정하면 됩니다 (public/images/ 폴더에 있어야 함)
const imageMap = {
  "MNPS 서문: 어둠의 4요소(Dark Tetrad)란 무엇인가?": "dark-tetrad.png",
  "현대 사회의 마키아벨리즘: 직장 내 정치의 기술": "machiavellianism.png",
  "나르시시즘의 두 얼굴: 거대함과 취약함": "narcissism.png",
  "사이코패스와 소시오패스: 냉혈한의 차이점": "psychopath-sociopath.png",
  "디지털 사디즘: 인터넷 트롤링의 심리학": "digital-sadism.png",
  "가스라이팅: 현실을 조작하는 마키아벨리적 전술": "gaslighting.png",
  "성공한 CEO들에게서 보이는 '어둠의 3요소'": "dark-triad-ceo.png",
  "공감 능력의 결여: 차가운 공감(Cold Empathy)": "empathy-post-8.png", // 기존 파일 사용
  "연애 권력 게임: 나르시시스트의 사랑 방식": "narcissist-relationship.png",
  "도덕적 허가(Moral Licensing): 착한 행동 뒤의 위선": "moral-licensing.png"
};

/**
 * 이미지 파일이 존재하는지 확인
 */
function checkImageFile(filename) {
  if (!filename) return false;
  const filePath = path.join(imagesDir, filename);
  return fs.existsSync(filePath);
}

/**
 * 로컬 이미지 경로를 반환 (/images/filename.png 형식)
 */
function getLocalImagePath(filename) {
  if (!filename) return null;
  return `/images/${filename}`;
}

async function updateBlogImages() {
  console.log('\n🖼️  블로그 포스트 이미지 업데이트 시작 (로컬 이미지 사용)...\n');

  // public/images 폴더 확인
  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ 이미지 폴더를 찾을 수 없습니다: ${imagesDir}`);
    console.error('💡 public/images/ 폴더를 생성하고 이미지 파일을 추가하세요.');
    return;
  }

  // 사용 가능한 이미지 파일 목록 출력
  const availableImages = fs.readdirSync(imagesDir)
    .filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file));
  
  console.log(`📁 사용 가능한 이미지 파일 (${availableImages.length}개):`);
  availableImages.forEach(img => console.log(`   - ${img}`));
  console.log('');

  try {
    // 모든 포스트 가져오기
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, image')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ 포스트 조회 실패:', fetchError.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️  블로그 포스트가 없습니다.');
      return;
    }

    console.log(`📋 총 ${posts.length}개의 포스트를 확인합니다.\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let missingCount = 0;

    // 각 포스트의 이미지 업데이트
    for (const post of posts) {
      const imageFilename = imageMap[post.title];

      if (!imageFilename) {
        console.log(`⚠️  "${post.title}" - 이미지 매핑 없음 (건너뜀)`);
        skippedCount++;
        continue;
      }

      // 이미지 파일 존재 확인
      if (!checkImageFile(imageFilename)) {
        console.log(`❌ "${post.title}" - 이미지 파일 없음: ${imageFilename}`);
        console.log(`   💡 public/images/${imageFilename} 파일을 추가하세요.`);
        missingCount++;
        continue;
      }

      const newImagePath = getLocalImagePath(imageFilename);

      // 이미지가 이미 올바른지 확인
      if (post.image === newImagePath) {
        console.log(`✓ "${post.title}" - 이미지 이미 올바름`);
        skippedCount++;
        continue;
      }

      // 이미지 업데이트
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ image: newImagePath })
        .eq('id', post.id);

      if (updateError) {
        console.error(`❌ "${post.title}" 업데이트 실패:`, updateError.message);
      } else {
        console.log(`✅ "${post.title}" - 이미지 업데이트 완료`);
        console.log(`   이전: ${post.image || '(없음)'}`);
        console.log(`   새로운: ${newImagePath}\n`);
        updatedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ 업데이트 완료!`);
    console.log(`   업데이트됨: ${updatedCount}개`);
    console.log(`   건너뜀: ${skippedCount}개`);
    console.log(`   파일 없음: ${missingCount}개`);
    console.log(`   총: ${posts.length}개`);
    console.log('='.repeat(50));

    if (missingCount > 0) {
      console.log('\n⚠️  일부 포스트에 이미지 파일이 없습니다.');
      console.log('💡 public/images/ 폴더에 필요한 이미지 파일을 추가한 후 다시 실행하세요.');
    } else {
      console.log('\n✨ 모든 블로그 포스트에 로컬 이미지가 설정되었습니다!');
    }

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

// 실행
updateBlogImages()
  .then(() => {
    console.log('\n작업 완료.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('예상치 못한 오류:', err);
    process.exit(1);
  });
