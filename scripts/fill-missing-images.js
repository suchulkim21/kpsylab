// fill-missing-images.js
// Script to fill missing blog post images using predefined image mapping
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Image mapping for posts (title -> image URL)
const imageMap = {
  "MNPS 서문: 어둠의 4요소(Dark Tetrad)란 무엇인가?": "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=1200&auto=format&fit=crop",
  "현대 사회의 마키아벨리즘: 직장 내 정치의 기술": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop",
  "나르시시즘의 두 얼굴: 거대함과 취약함": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop",
  "사이코패스와 소시오패스: 냉혈한의 차이점": "https://images.unsplash.com/photo-1606103836293-0a063ee20566?w=1200&auto=format&fit=crop",
  "디지털 사디즘: 인터넷 트롤링의 심리학": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop",
  "가스라이팅: 현실을 조작하는 마키아벨리적 전술": "https://images.unsplash.com/photo-1578958505797-06bca05c8e9f?w=1200&auto=format&fit=crop",
  "성공한 CEO들에게서 보이는 '어둠의 3요소'": "https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&auto=format&fit=crop",
  "공감 능력의 결여: 차가운 공감(Cold Empathy)": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop",
  "연애 권력 게임: 나르시시스트의 사랑 방식": "https://images.unsplash.com/photo-1606628697412-0cc4a23031c4?w=1200&auto=format&fit=crop",
  "도덕적 허가(Moral Licensing): 착한 행동 뒤의 위선": "https://images.unsplash.com/photo-1606628703404-cded8e7aa98f?w=1200&auto=format&fit=crop"
};

async function fillMissingImages() {
  console.log('\n🖼️  시작: 누락된 이미지 채우기...\n');
  // Fetch posts with missing image (null or empty string)
  const { data: posts, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id, title, image')
    .or('image.is.null,image.eq.') // image is null or empty
    .order('id', { ascending: true });

  if (fetchError) {
    console.error('❌ 포스트 조회 실패:', fetchError.message);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('✅ 모든 포스트에 이미지가 존재합니다.');
    return;
  }

  console.log(`📋 누락된 이미지가 ${posts.length}개 포스트에 있습니다.`);
  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const newImage = imageMap[post.title];
    if (!newImage) {
      console.log(`⚠️  "${post.title}" - 매핑 없음 (건너뜀)`);
      skipped++;
      continue;
    }
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ image: newImage })
      .eq('id', post.id);
    if (updateError) {
      console.error(`❌ "${post.title}" 업데이트 실패:`, updateError.message);
    } else {
      console.log(`✅ "${post.title}" - 이미지 업데이트 완료`);
      updated++;
    }
  }

  console.log('\n=== 결과 ===');
  console.log(`   업데이트된 포스트: ${updated}`);
  console.log(`   매핑 없음 건너뜀: ${skipped}`);
  console.log('=== 완료 ===\n');
}

fillMissingImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 예상치 못한 오류:', err);
    process.exit(1);
  });
