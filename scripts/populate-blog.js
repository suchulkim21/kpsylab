const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'mnps', 'mnps-service', 'blog.db');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log('DB Error:', err.message);
        process.exit(1);
    }
    console.log('Connected to blog database');
});

// 원본 블로그 포스트 데이터 (mnps/_LEGACY/populate_blog.js에서 가져옴)
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
        tags: "MNPS,심리학,개론",
        image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800&auto=format&fit=crop"
    },
    {
        title: "현대 사회의 마키아벨리즘: 직장 내 정치의 기술",
        content: `
            <h3>목적을 위해 수단을 정당화하다</h3>
            <p>니콜로 마키아벨리의 '군주론'에서 유래한 마키아벨리즘은 현대 직장 생활에서 '사내 정치'라는 형태로 빈번하게 나타납니다. 높은 마키아벨리즘 성향을 가진 사람들은 조직의 구조를 파악하고, 정보와 인맥을 전략적으로 활용하여 자신의 목표를 달성하는 데 능숙합니다.</p>
            <p>이들은 겉으로는 협조적이고 매력적으로 보일 수 있지만, 이면에는 냉철한 계산이 깔려 있습니다. 리더십 위치에서 이들은 효율적인 결정을 내리는 강점을 보일 수 있으나, 장기적으로는 동료들의 신뢰를 잃을 위험도 존재합니다.</p>
        `,
        author: "MNPS Analyst",
        tags: "마키아벨리즘,직장심리,리더십",
        image: "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?w=800&auto=format&fit=crop"
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
        tags: "나르시시즘,성격유형,자존감",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop"
    },
    {
        title: "사이코패스와 소시오패스: 냉혈한의 차이점",
        content: `
            <h3>선천적인가, 후천적인가?</h3>
            <p>대중 매체에서 혼용되어 사용되지만, 심리학 및 범죄학적 관점에서 미묘한 차이가 있습니다. 사이코패스는 주로 선천적인 뇌 구조(편도체 비활성화 등)와 관련이 깊어 공포나 공감을 생물학적으로 느끼기 어렵습니다.</p>
            <p>반면 소시오패스는 후천적인 환경, 즉 학대나 방임 등에 의해 형성되는 경우가 많으며, 제한적인 범위 내에서는 유대감을 형성하기도 합니다. MNPS 검사는 이러한 반사회적 성향의 스펙트럼을 측정합니다.</p>
        `,
        author: "Forensic Ph.D.",
        tags: "사이코패스,소시오패스,범죄심리",
        image: "https://images.unsplash.com/photo-1606103836293-0a063ee20566?w=800&auto=format&fit=crop"
    },
    {
        title: "디지털 사디즘: 인터넷 트롤링의 심리학",
        content: `
            <h3>익명성 뒤에 숨은 잔혹함</h3>
            <p>일상 생활에서는 평범해 보이는 사람이 온라인에서는 악플러나 트롤이 되는 이유는 무엇일까요? 연구에 따르면, 인터넷 트롤링은 '일상적 사디즘(Everyday Sadism)'과 가장 강력한 상관관계를 가집니다.</p>
            <p>이들은 타인을 괴롭히고 혼란에 빠뜨리는 것 자체에서 내재적인 보상(쾌락)을 얻습니다. 온라인의 익명성은 이러한 충동을 실행에 옮기는 데 있어 도덕적 제동 장치를 해제하는 역할을 합니다.</p>
        `,
        author: "Cyber Psych",
        tags: "사디즘,인터넷,트롤링",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop"
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
        tags: "가스라이팅,마키아벨리즘,관계심리",
        image: "https://images.unsplash.com/photo-1578958505797-06bca05c8e9f?w=800&auto=format&fit=crop"
    },
    {
        title: "성공한 CEO들에게서 보이는 '어둠의 3요소'",
        content: `
            <h3>성공의 득과 실</h3>
            <p>놀답게도 많은 성공한 기업가나 리더들에게서 사이코패스나 마키아벨리즘 성향이 평균보다 높게 나타납니다. 냉철한 의자결정, 감정에 휘둘리지 않는 태도, 매력적인 언변은 비즈니스 정글에서 생존하는 데 유리한 무기가 됩니다.</p>
            <p>그러나 이러한 성향은 양날의 검입니다. 단기적인 성과는 낼 수 있으나, 장기적으로는 기업 윤리의 붕괴나 조직 문화의 황폐화를 초래할 수 있습니다.</p>
        `,
        author: "Biz Insider",
        tags: "CEO,성공심리,리더십",
        image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&auto=format&fit=crop"
    },
    {
        title: "공감 능력의 결여: 차가운 공감(Cold Empathy)",
        content: `
            <h3>알지만 느끼지 않는다</h3>
            <p>사이코패스나 나르시시스트가 공감 능력이 아예 없다고 생각하는 것은 오해입니다. 그들은 '인지적 공감(Cognitive Empathy)' 능력은 뛰어날 수 있습니다. 즉, 당신이 기분이 나쁘다는 것은 *알지만*, 당신의 기분에 *함께 아파하지는* 않습니다.</p>
            <p>이 '차가운 공감' 능력은 타인의 감정을 파악하여 조종하는 도구로 사용됩니다. 그들이 매력적으로 보이는 이유도 바로 여러분이 무엇을 원하는지 정확히 파악하고 있기 때문입니다.</p>
        `,
        author: "Dr. Shadow",
        tags: "공감,사이코패스,심리기제",
        image: "https://images.unsplash.com/photo-1518599808920-555fb7cb81d9?w=800&auto=format&fit=crop"
    },
    {
        title: "연애 권력 게임: 나르시시스트의 사랑 방식",
        content: `
            <h3>이상화, 평가절하, 그리고 폐기</h3>
            <p>나르시시스트와의 연애는 롤러코스터와 같습니다. 초기에는 '러브 바밍(Love Bombing)'을 통해 상대를 완벽한 이상형으로 추어올립니다. 하지만 관계가 안정되면 곧 상대를 깎아내리기 시작(Devaluation)합니다.</p>
            <p>그들은 파트너를 독립적인 인격체가 아닌, 자신의 자존감을 채워주는 도구(Narcissistic Supply)로 인식합니다. 도구의 효용이 다하면 가차 없이 버려질 수(Discard) 있습니다.</p>
        `,
        author: "Romance Decoded",
        tags: "연애,나르시시즘,관계",
        image: "https://images.unsplash.com/photo-1606628697412-0cc4a23031c4?w=800&auto=format&fit=crop"
    },
    {
        title: "도덕적 허가(Moral Licensing): 착한 행동 뒤의 위선",
        content: `
            <h3>"나는 이만큼 했으니까 괜찮아"</h3>
            <p>인간은 긍정적인 행동(기부, 선행)을 한 후에, 비도덕적인 행동을 해도 된다는 무의식적인 허가를 자신에게 내리는 경향이 있습니다. 이는 마키아벨리적 성향과 결합하여 위선적인 태도로 나타날 수 있습니다.</p>
            <p>자신을 도덕적으로 우월하다고 믿는 순간, 가장 비윤리적인 선택을 할 위험이 커집니다. MNPS는 이러한 자기기만 기제를 경계합니다.</p>
        `,
        author: "Ethics Lab",
        tags: "도덕,심리효과,위선",
        image: "https://images.unsplash.com/photo-1606628703404-cded8e7aa98f?w=800&auto=format&fit=crop"
    },
    {
        title: "SNS 시대의 보여주기식 삶과 MNPS",
        content: `
            <h3>좋아요 숫자에 갇힌 자아</h3>
            <p>소셜 미디어는 나르시시즘이 배양되기 완벽한 환경을 제공합니다. 편집된 삶, 과시적인 소비, 좋아요에 대한 집착은 우리의 뇌 보상 회로를 자극합니다.</p>
            <p>연구에 따르면 과도한 SNS 사용은 타인과의 비교를 통해 우울감을 증폭시키거나, 반대로 방어적인 나르시시즘을 강화시킬 수 있습니다. 디지털 디톡스가 필요한 이유입니다.</p>
        `,
        author: "Digital Mind",
        tags: "SNS,나르시시즘,현대사회",
        image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop"
    },
    {
        title: "조용한 위험: 수동 공격성(Passive Aggression)",
        content: `
            <h3>웃으면서 찌르는 칼</h3>
            <p>직접적인 충돌을 피하면서 상대방을 공격하는 수동 공격성은 고도로 세련된 사디즘의 형태일 수 있습니다. 고의적인 지연, 모호한 칭찬, 침묵 요법 등은 피해자를 혼란스럽게 만들고 화를 내는 사람을 이상하게 만듭니다.</p>
            <p>이는 마키아벨리적 계산과 사디즘적 쾌락이 혼합된 행동 양식으로, 조직이나 가정 내의 분위기를 서서히 망가뜨립니다.</p>
        `,
        author: "Conflict Mgr",
        tags: "수동공격,관계갈등,심리전",
        image: "https://images.unsplash.com/photo-1503269094014-238e74b0b63b?w=800&auto=format&fit=crop"
    },
    {
        title: "진화심리학으로 본 어둠의 성격",
        content: `
            <h3>왜 이러한 성격은 사라지지 않았는가?</h3>
            <p>진화심리학에서는 어둠의 3요소가 짝짓기와 생존 전략의 일종으로 진화했다고 봅니다. 단기적인 짝짓기 전략(나르시시즘, 사이코패스)이나 자원 획득(마키아벨리즘)에 유리한 측면이 있었기 때문에 자연선택 과정에서 도태되지 않고 살아남았다는 것입니다.</p>
            <p>"빠른 인생 전략(Fast Life History Strategy)"을 취하는 이들은 위험을 감수하고 즉각적인 보상을 추구하는 경향이 있습니다.</p>
        `,
        author: "EvoPsych",
        tags: "진화심리학,생존전략,본능",
        image: "https://plus.unsplash.com/premium_photo-1679695191632-7cd0ed724310?w=800&auto=format&fit=crop"
    },
    {
        title: "유머 감각과 지능, 그리고 사디즘",
        content: `
            <h3>블랙 코미디를 좋아하는 사람들</h3>
            <p>풍자나 블랙 코미디를 즐기는 것과 사디즘 성향 사이에 상관관계가 있을까요? 일부 연구는 공격적인 유머 스타일(타인을 깎아내리는 농담)이 높은 마키아벨리즘 및 사이코패스 성향과 관련이 있음을 시사합니다.</p>
            <p>하지만 동시에 높은 지능과도 연관됩니다. 복잡한 상황의 아이러니를 이해해야 하기 때문입니다. 웃음 뒤에 숨겨진 칼날을 조심하세요.</p>
        `,
        author: "Humor Analyst",
        tags: "유머,지능,사디즘",
        image: "https://plus.unsplash.com/premium_photo-1710681610926-ddc321f7809a?w=800&auto=format&fit=crop"
    },
    {
        title: "협상의 기술: 마키아벨리스트를 이기는 법",
        content: `
            <h3>감정을 배제하고 이익에 집중하라</h3>
            <p>마키아벨리 성향이 강한 사람과 협상할 때는 감정에 호소하는 전략이 통하지 않습니다. 그들은 당신의 감정을 약점으로 이용할 것입니다.</p>
            <p>대신 명확한 이익과 손해(당근과 채찍)를 제시해야 합니다. 계약 조건을 꼼꼼히 문서화하고, 그들의 평판을 이용하는 전략이 유효합니다. 그들의 "Win-Lose" 게임을 "Win-Win" 구조로 강제 재편해야 합니다.</p>
        `,
        author: "Negotiator King",
        tags: "협상,비즈니스,마키아벨리즘",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop"
    },
    {
        title: "그림자 통합(Integrate the Shadow): 칼 융의 해법",
        content: `
            <h3>내면의 괴물을 길들이기</h3>
            <p>칼 융은 "자신의 그림자를 모르는 자는 그림자에 잡아먹힌다"고 했습니다. 우리 안의 MNPS 성향을 무조건 억압하거나 부정하면, 그것은 무의식중에 폭발하거나 투사(Projection)의 형태로 타인을 비난하는 데 쓰입니다.</p>
            <p>건강한 인격 발달은 내면의 어두운 충동을 인지하고, 그것을 창조적이거나 사회적으로 용인되는 방식으로 승화시키는 과정(개성화)을 통해 이루어집니다.</p>
        `,
        author: "Jungian Dr.",
        tags: "칼융,그림자,심리치유",
        image: "https://images.unsplash.com/photo-1531297461136-82af022f0865?w=800&auto=format&fit=crop"
    },
    {
        title: "사랑에 빠진 사이코패스? 불가능한 신화인가",
        content: `
            <h3>애착과 소유욕의 혼동</h3>
            <p>사이코패스도 결혼을 하고 장기적인 관계를 맺습니다. 하지만 그들의 사랑은 일반적인 정서적 유대와는 다릅니다. 그들에게 파트너는 '소중한 소유물'에 가깝습니다.</p>
            <p>자신의 소유물을 잃기 싫어하는 강력한 질투나 집착을 사랑으로 포장할 수 있습니다. 그들의 관계 유지 동기는 정서적 교감이 아닌 편의성이나 사회적 위장일 가능성이 높습니다.</p>
        `,
        author: "Love Lab",
        tags: "사이코패스,사랑,애착유형",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop"
    },
    {
        title: "MNPS 성향이 예술과 창작에 미치는 영향",
        content: `
            <h3>고통과 광기 속의 예술혼</h3>
            <p>역사상 많은 천재적인 예술가들이 높은 나르시시즘이나 우울 기질, 정서적 불안정을 보였습니다. 강렬한 자의식과 남들과 다르다는 특별함에 대한 믿음은 기존의 관습을 파괴하는 혁신적인 예술의 원동력이 되기도 합니다.</p>
            <p>피카소, 달리 등 거장들의 삶에서 엿보이는 어둠의 성격적 특성들이 그들의 작품에 어떤 깊이를 부여했는지 분석해봅니다.</p>
        `,
        author: "Art Critics",
        tags: "예술,창의성,나르시시즘",
        image: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&auto=format&fit=crop"
    },
    {
        title: "아이들에게서 나타나는 냉담함(Callous-Unemotional)",
        content: `
            <h3>조기 발견과 개입의 중요성</h3>
            <p>아동기에 나타나는 '냉담-무정서(CU)' 특성은 성인기 사이코패스로 발전할 수 있는 위험 신호입니다. 타인의 감정에 무관심하고, 죄책감을 느끼지 않는 아이들은 일반적인 훈육 방식이 통하지 않습니다.</p>
            <p>처벌보다는 긍정적 보상과 눈맞춤을 통한 정서 교육이 효과적입니다. 조기 개입은 뇌의 가소성을 이용해 긍정적인 변화를 이끌어낼 수 있는 골든타임입니다.</p>
        `,
        author: "Child Psych",
        tags: "아동심리,육아,발달심리",
        image: "https://images.unsplash.com/photo-1473679408190-0693dd22fe6a?w=800&auto=format&fit=crop"
    },
    {
        title: "진정한 리더십: 어둠을 넘어선 빛",
        content: `
            <h3>MNPS를 극복한 서번트 리더십</h3>
            <p>어둠의 리더십이 단기적 성과를 낼 수 있다면, 지속 가능한 성장은 '진정성 리더십'과 '서번트 리더십'에서 나옵니다. 자신의 약점을 인정할 줄 아는 용기(반-나르시시즘), 구성원의 성장을 돕는 이타성(반-마키아벨리즘)이 결국엔 조직을 더 단단하게 만듭니다.</p>
            <p>우리는 리더를 선택할 때 카리스마라는 가면 뒤에 숨겨진 인격을 꿰뚫어 볼 지혜가 필요합니다.</p>
        `,
        author: "Leadership Coach",
        tags: "리더십,조직문화,성장",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
    }
];

db.serialize(() => {
    // 기존 테이블 삭제하고 새로 생성
    db.run("DROP TABLE IF EXISTS posts", (err) => {
        if (err) {
            console.error('Error dropping table:', err.message);
            process.exit(1);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        image TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            process.exit(1);
        }
    });

    const stmt = db.prepare(`INSERT INTO posts (title, content, author, date, tags, image) VALUES (?, ?, ?, ?, ?, ?)`);
    const today = new Date().toISOString().split('T')[0];

    let completed = 0;
    posts.forEach((post, index) => {
        stmt.run(post.title, post.content.trim(), post.author, today, post.tags, post.image, function (err) {
            if (err) {
                console.error(`Error inserting post ${post.title}:`, err.message);
            } else {
                console.log(`Inserted: ${post.title}`);
                completed++;
            }
            if (completed === posts.length) {
                console.log(`Successfully inserted ${completed} blog posts`);
                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing statement:', err.message);
                    }
                    db.close();
                });
            }
        });
    });
});