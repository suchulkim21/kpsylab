/**
 * Supabase에 블로그 포스트 데이터 추가 스크립트
 * KPSY LAB Portal
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '미설정');
  console.error('\n.env.local 파일에 다음 변수를 설정하세요:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 블로그 포스트 데이터
const posts = [
  {
    title: "MNPS 서문: 어둠의 4요소(Dark Tetrad)란 무엇인가?",
    content: `
      <h3>인간 본성의 숨겨진 그림자</h3>
      <p>심리학에서 '어둠의 3요소(Dark Triad)'는 나르시시즘(Narcissism), 마키아벨리즘(Machiavellianism), 사이코패스(Psychopathy)를 일컫습니다. 최근 연구에서는 여기에 사디즘(Sadism)을 더해 '어둠의 4요소(Dark Tetrad)'라고 부릅니다. MNPS는 이 네 가지 성향을 분석하여 인간 내면의 복잡성을 탐구합니다.</p>
      <p>이 성향들은 병리적인 범죄자와만 관련된 것이 아닙니다. 우리 모두의 내면에 다양한 농도로 존재하며, 사회적 성공이나 리더십의 원동력이 되기도, 파괴적인 관계의 원인이 되기도 합니다.</p>
      <ul>
        <li><strong>M</strong>achiavellianism: 전략적 조작과 계산</li>
        <li><strong>N</strong>arcissism: 자아 도취와 인정 욕구</li>
        <li><strong>P</strong>sychopathy: 공감 결여와 충동성</li>
        <li><strong>S</strong>adism: 타인의 고통에서 느끼는 쾌락</li>
      </ul>
    `,
    author: "Dr. Shadow",
    date: new Date().toISOString().split('T')[0],
    tags: "MNPS,심리학,개론",
    image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=1200&auto=format&fit=crop"
  },
  {
    title: "현대 사회의 마키아벨리즘: 직장 내 정치의 기술",
    content: `
      <h3>목적을 위해 수단을 정당화하다</h3>
      <p>니콜로 마키아벨리의 '군주론'에서 유래한 마키아벨리즘은 현대 직장 생활에서 '사내 정치'라는 형태로 빈번하게 나타납니다. 높은 마키아벨리즘 성향을 가진 사람들은 조직의 구조를 파악하고, 정보와 인맥을 전략적으로 활용하여 자신의 목표를 달성하는 데 능숙합니다.</p>
      <p>이들은 겉으로는 협조적이고 매력적으로 보일 수 있지만, 이면에는 냉철한 계산이 깔려 있습니다. 리더십 위치에서 이들은 효율적인 결정을 내리는 강점을 보일 수 있으나, 장기적으로는 동료들의 신뢰를 잃을 위험도 존재합니다.</p>
    `,
    author: "MNPS Analyst",
    date: new Date().toISOString().split('T')[0],
    tags: "마키아벨리즘,직장심리,리더십",
    image: "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?w=1200&auto=format&fit=crop"
  },
  {
    title: "나르시시즘의 두 얼굴: 거대함과 취약함",
    content: `
      <h3>자신을 사랑하는 것 이상의 문제</h3>
      <p>나르시시즘은 단순히 거울을 보며 즐거워하는 것이 아닙니다. 심리학적으로 나르시시즘은 크게 두 가지 유형으로 나뉩니다.</p>
      <ol>
        <li><strong>거대성(Grandios) 나르시시즘:</strong> 외향적이고 자신감이 넘치며, 타인의 관심을 즐깁니다. 우리가 흔히 생각하는 나르시시스트의 전형입니다.</li>
        <li><strong>취약성(Vulnerable) 나르시시즘:</strong> 내향적이고 예민하며, 타인의 평가에 과도하게 신경 씁니다. 겉으로는 조용해 보이지만, 내면에는 '나는 특별 대우를 받아야 한다'는 비현실적인 기대와 깊은 수치심이 공존합니다.</li>
      </ol>
    `,
    author: "Prof. Mirror",
    date: new Date().toISOString().split('T')[0],
    tags: "나르시시즘,성격유형,자존감",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop"
  },
  {
    title: "사이코패스와 소시오패스: 냉혈한의 차이점",
    content: `
      <h3>선천적인가, 후천적인가?</h3>
      <p>대중 매체에서 혼용되어 사용되지만, 심리학 및 범죄학적 관점에서 미묘한 차이가 있습니다. 사이코패스는 주로 선천적인 뇌 구조(편도체 비활성화 등)와 관련이 깊어 공포나 공감을 생물학적으로 느끼기 어렵습니다.</p>
      <p>반면 소시오패스는 후천적인 환경, 즉 학대나 방임 등에 의해 형성되는 경우가 많으며, 제한적인 범위 내에서는 유대감을 형성하기도 합니다. MNPS 검사는 이러한 반사회적 성향의 스펙트럼을 측정합니다.</p>
    `,
    author: "Forensic Ph.D.",
    date: new Date().toISOString().split('T')[0],
    tags: "사이코패스,소시오패스,범죄심리",
    image: "https://images.unsplash.com/photo-1606103836293-0a063ee20566?w=1200&auto=format&fit=crop"
  },
  {
    title: "디지털 사디즘: 인터넷 트롤링의 심리학",
    content: `
      <h3>익명성 뒤에 숨은 잔혹함</h3>
      <p>일상 생활에서는 평범해 보이는 사람이 온라인에서는 악플러나 트롤이 되는 이유는 무엇일까요? 연구에 따르면, 인터넷 트롤링은 '일상적 사디즘(Everyday Sadism)'과 가장 강력한 상관관계를 가집니다.</p>
      <p>이들은 타인을 괴롭히고 혼란에 빠뜨리는 것 자체에서 내재적인 보상(쾌락)을 얻습니다. 온라인의 익명성은 이러한 충동을 실행에 옮기는 데 있어 도덕적 제동 장치를 해제하는 역할을 합니다.</p>
    `,
    author: "Cyber Psych",
    date: new Date().toISOString().split('T')[0],
    tags: "사디즘,인터넷,트롤링",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop"
  },
  {
    title: "가스라이팅: 현실을 조작하는 마키아벨리적 전술",
    content: `
      <h3>당신의 기억은 틀리지 않았다</h3>
      <p>가스라이팅은 피해자가 자신의 기억, 지각, 이성을 의심하게 만드는 심리적 조작 행위입니다. 이는 고도의 마키아벨리즘적 전술로, 상대방을 심리적으로 무력화시켜 통제하는 것을 목표로 합니다.</p>
      <blockquote>"네가 너무 예민한 거야."<br>"그런 일은 일어난 적 없어."</blockquote>
      <p>이러한 반복적인 부정은 피해자의 자아를 붕괴시킵니다. 가스라이팅을 인지하는 것이 방어의 첫걸음입니다.</p>
    `,
    author: "Defense Lab",
    date: new Date().toISOString().split('T')[0],
    tags: "가스라이팅,마키아벨리즘,관계심리",
    image: "https://images.unsplash.com/photo-1578958505797-06bca05c8e9f?w=1200&auto=format&fit=crop"
  },
  {
    title: "성공한 CEO들에게서 보이는 '어둠의 3요소'",
    content: `
      <h3>성공의 득과 실</h3>
      <p>놀랍게도 많은 성공한 기업가나 리더들에게서 사이코패스나 마키아벨리즘 성향이 평균보다 높게 나타납니다. 냉철한 의사결정, 감정에 휘둘리지 않는 태도, 매력적인 언변은 비즈니스 정글에서 생존하는 데 유리한 무기가 됩니다.</p>
      <p>그러나 이러한 성향은 양날의 검입니다. 단기적인 성과는 낼 수 있으나, 장기적으로는 기업 윤리의 붕괴나 조직 문화의 황폐화를 초래할 수 있습니다.</p>
    `,
    author: "Biz Insider",
    date: new Date().toISOString().split('T')[0],
    tags: "CEO,성공심리,리더십",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&auto=format&fit=crop"
  },
  {
    title: "공감 능력의 결여: 차가운 공감(Cold Empathy)",
    content: `
      <h3>알지만 느끼지 않는다</h3>
      <p>사이코패스나 나르시시스트가 공감 능력이 아예 없다고 생각하는 것은 오해입니다. 그들은 '인지적 공감(Cognitive Empathy)' 능력은 뛰어날 수 있습니다. 즉, 당신이 기분이 나쁘다는 것은 *알지만*, 당신의 기분에 *함께 아파하지는* 않습니다.</p>
      <p>이 '차가운 공감' 능력은 타인의 감정을 파악하여 조종하는 도구로 사용됩니다. 그들이 매력적으로 보이는 이유도 바로 여러분이 무엇을 원하는지 정확히 파악하고 있기 때문입니다.</p>
    `,
    author: "Dr. Shadow",
    date: new Date().toISOString().split('T')[0],
    tags: "공감,사이코패스,심리기제",
    image: "https://images.unsplash.com/photo-1518599808920-555fb7cb81d9?w=1200&auto=format&fit=crop"
  },
  {
    title: "연애 권력 게임: 나르시시스트의 사랑 방식",
    content: `
      <h3>이상화, 평가절하, 그리고 폐기</h3>
      <p>나르시시스트와의 연애는 롤러코스터와 같습니다. 초기에는 '러브 바밍(Love Bombing)'을 통해 상대를 완벽한 이상형으로 추어올립니다. 하지만 관계가 안정되면 곧 상대를 깎아내리기 시작(Devaluation)합니다.</p>
      <p>그들은 파트너를 독립적인 인격체가 아닌, 자신의 자존감을 채워주는 도구(Narcissistic Supply)로 인식합니다. 도구의 효용이 다하면 가차 없이 버려질 수(Discard) 있습니다.</p>
    `,
    author: "Romance Decoded",
    date: new Date().toISOString().split('T')[0],
    tags: "연애,나르시시즘,관계",
    image: "https://images.unsplash.com/photo-1606628697412-0cc4a23031c4?w=1200&auto=format&fit=crop"
  },
  {
    title: "도덕적 허가(Moral Licensing): 착한 행동 뒤의 위선",
    content: `
      <h3>"나는 이만큼 했으니까 괜찮아"</h3>
      <p>인간은 긍정적인 행동(기부, 선행)을 한 후에, 비도덕적인 행동을 해도 된다는 무의식적인 허가를 자신에게 내리는 경향이 있습니다. 이는 마키아벨리적 성향과 결합하여 위선적인 태도로 나타날 수 있습니다.</p>
      <p>자신을 도덕적으로 우월하다고 믿는 순간, 가장 비윤리적인 선택을 할 위험이 커집니다. MNPS는 이러한 자기기만 기제를 경계합니다.</p>
    `,
    author: "Ethics Lab",
    date: new Date().toISOString().split('T')[0],
    tags: "도덕,심리효과,위선",
    image: "https://images.unsplash.com/photo-1606628703404-cded8e7aa98f?w=1200&auto=format&fit=crop"
  }
];

async function populateBlogPosts() {
  console.log('\n📝 Supabase에 블로그 포스트 추가 시작...\n');

  try {
    // 기존 포스트 확인
    const { data: existingPosts, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST205' && checkError.code !== 'PGRST206') {
      console.error('❌ 테이블 확인 실패:', checkError.message);
      return;
    }

    if (existingPosts && existingPosts.length > 0) {
      console.log('⚠️  이미 블로그 포스트가 존재합니다.');
      console.log('   기존 데이터를 유지합니다. 새로 추가하려면 Supabase 대시보드에서 수동으로 삭제하세요.\n');
      return;
    }

    // 포스트 추가
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(
        posts.map(post => ({
          title: post.title,
          content: post.content.trim(),
          author: post.author,
          date: post.date,
          tags: post.tags,
          image: post.image
        }))
      )
      .select();

    if (error) {
      console.error('❌ 블로그 포스트 추가 실패:', error.message);
      console.error('   오류 코드:', error.code);
      if (error.code === 'PGRST205' || error.code === 'PGRST206') {
        console.error('\n   💡 해결 방법:');
        console.error('   1. Supabase 대시보드에서 blog_posts 테이블이 생성되었는지 확인');
        console.error('   2. lib/db/supabase-schema.sql 파일의 내용을 Supabase SQL Editor에서 실행');
      }
      return;
    }

    console.log(`✅ ${data.length}개의 블로그 포스트가 성공적으로 추가되었습니다!\n`);
    console.log('추가된 포스트:');
    data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
    });
    console.log('\n✨ 완료! 이제 웹사이트에서 블로그 글이 표시됩니다.');

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

// 실행
populateBlogPosts()
  .then(() => {
    console.log('\n작업 완료.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('예상치 못한 오류:', err);
    process.exit(1);
  });
