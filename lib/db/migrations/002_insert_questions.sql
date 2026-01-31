-- Dark Nature Test 초기 문항 데이터 삽입
-- 001_dark_nature_test.sql 실행 후 실행

-- 문항 삽입 (36문항)
INSERT INTO questions (id, category, trait, sub_factor, content, question_order, weight, reverse_scored) VALUES
-- 초반 (1~10): 가벼운 문항
('n1', 'darkTetrad', 'narcissism', 'egoism', '나는 때때로 내가 남보다 낫다고 생각한다.', 1, 1.0, false),
('n2', 'darkTetrad', 'narcissism', 'egoism', '사람들의 관심과 칭찬을 받는 것이 중요하다.', 2, 1.0, false),
('n3', 'darkTetrad', 'narcissism', 'entitlement', '내가 원하는 것은 당연히 받아들여져야 한다고 느낀다.', 3, 1.0, false),
('n4', 'darkTetrad', 'narcissism', 'entitlement', '평범한 삶은 나에게 맞지 않는다.', 4, 1.0, false),
('e1', 'dFactor', NULL, 'egoism', '내 이익이 우선이다.', 5, 1.0, false),
('e2', 'dFactor', NULL, 'egoism', '다른 사람의 문제보다 내 문제가 더 중요하다.', 6, 1.0, false),
('e3', 'dFactor', NULL, 'egoism', '내가 먼저 챙겨야 할 것이 많다.', 7, 1.0, false),
('en1', 'dFactor', NULL, 'entitlement', '나는 특별한 대우를 받을 자격이 있다.', 8, 1.0, false),
('en2', 'dFactor', NULL, 'entitlement', '내가 원하는 것은 당연한 권리다.', 9, 1.0, false),
('en3', 'dFactor', NULL, 'entitlement', '다른 사람들은 내가 원하는 대로 해줘야 한다.', 10, 1.0, false),

-- 중반 (11~25): 핵심 다크 테트라드 + 시나리오
('m1', 'darkTetrad', 'machiavellianism', 'moralDisengagement', '중요한 목표를 달성하기 위해서라면 사소한 도덕적 규칙은 유연하게 적용할 수 있다.', 11, 1.0, false),
('m2', 'darkTetrad', 'machiavellianism', 'moralDisengagement', '사람들을 내 의도대로 움직이기 위해 상황에 맞는 가면(거짓말)을 쓰는 것은 사회적 지능이다.', 12, 1.0, false),
('m3', 'darkTetrad', 'machiavellianism', 'moralDisengagement', '경쟁에서 승리하기 위해 상대방의 약점을 파악하고 활용하는 것은 당연한 전략이다.', 13, 1.0, false),
('m4', 'darkTetrad', 'machiavellianism', 'moralDisengagement', '대인관계에서 신뢰보다는 상대방이 나에게 얼마나 유용한지를 먼저 판단한다.', 14, 1.0, false),
('p1', 'darkTetrad', 'psychopathy', 'moralDisengagement', '나는 즉흥적으로 행동하는 편이다.', 15, 1.0, false),
('p2', 'darkTetrad', 'psychopathy', 'moralDisengagement', '타인의 고통에 크게 공감하지 않는 편이다.', 16, 1.0, false),
('p3', 'darkTetrad', 'psychopathy', 'moralDisengagement', '위험하거나 스릴 있는 일을 즐기는 편이다.', 17, 1.0, false),
('p4', 'darkTetrad', 'psychopathy', 'moralDisengagement', '내 행동에 대해 변명하거나 남 탓을 하는 경우가 있다.', 18, 1.0, false),
('sc1', 'scenario', NULL, NULL, '회사에서 승진을 위해 경쟁자가 실수하도록 정보를 조작할 기회가 생겼다. 나는:', 19, 1.0, false),
('sc2', 'scenario', NULL, NULL, '친구가 나에게 상처를 줬다. 나는 그 친구를 공개적으로 비난하거나 불편하게 만들 기회가 있다. 나는:', 20, 1.0, false),
('sc3', 'scenario', NULL, NULL, '팀 프로젝트에서 내 기여가 인정받지 못했다. 나는:', 21, 1.0, false),
('sc4', 'scenario', NULL, NULL, '중요한 결정을 내려야 하는데, 다른 사람의 감정을 고려하면 내 이익이 줄어든다. 나는:', 22, 1.0, false),
('md1', 'dFactor', NULL, 'moralDisengagement', '결과가 좋다면 과정에서의 희생이나 기만은 정당화될 수 있다고 믿는다.', 23, 1.0, false),
('md2', 'dFactor', NULL, 'moralDisengagement', '사람들은 본질적으로 이기적이기 때문에, 나 또한 그들에게 이용당하지 않도록 먼저 조종해야 한다.', 24, 1.0, false),
('md3', 'dFactor', NULL, 'moralDisengagement', '상황에 따라 도덕적 기준을 유연하게 적용하는 것이 현실적이다.', 25, 1.0, false),

-- 후반 (26~36): 강한 문항
('s1', 'darkTetrad', 'sadism', 'spitefulness', '상대방이 논리적으로 반박하지 못하고 당황하는 모습을 볼 때 묘한 승리감을 느낀다.', 26, 1.0, false),
('s2', 'darkTetrad', 'sadism', 'spitefulness', '영화나 드라마에서 악당이 주인공을 교묘하게 괴롭히는 장면에 더 몰입하고 대리 만족을 느낀다.', 27, 1.0, false),
('s3', 'darkTetrad', 'sadism', 'spitefulness', '농담이나 장난을 통해 타인의 자존감을 살짝 건드리고 반응을 살피는 것이 재미있다.', 28, 1.0, false),
('s4', 'darkTetrad', 'sadism', 'spitefulness', '나보다 강한 척하는 사람의 기를 꺾어 놓을 때 큰 희열을 느낀다.', 29, 1.0, false),
('sp1', 'dFactor', NULL, 'spitefulness', '가끔은 이유 없이 누군가를 화나게 만들고 그 상황을 관찰하는 것이 흥미롭다.', 30, 1.0, false),
('sp2', 'dFactor', NULL, 'spitefulness', '타인의 불행이나 실수를 보았을 때, 위로보다는 "그럴 줄 알았다"는 식의 즐거움이 먼저 든다.', 31, 1.0, false),
('sp3', 'dFactor', NULL, 'spitefulness', '상대가 손해를 보는 것이 내게 이익이 된다면 기꺼이 그렇게 한다.', 32, 1.0, false),
('v1', 'validation', NULL, NULL, '나는 항상 정직하게 답변했다.', 33, 1.0, false),
('v2', 'validation', NULL, NULL, '이 테스트에서 내가 선택한 답변은 일관성이 있다.', 34, 1.0, false),
('v3', 'validation', NULL, NULL, '나는 사회적으로 바람직한 답변을 선택하려고 노력했다.', 35, 1.0, true),
('v4', 'validation', NULL, NULL, '내 답변은 내 실제 생각을 반영한다.', 36, 1.0, false)
ON CONFLICT (id) DO NOTHING;
