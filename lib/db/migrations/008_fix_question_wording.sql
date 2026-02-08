-- 기존 42문항 중 기술적 문제(문법·표현·이중구조·모호함) 수정
-- questions.ts와 동일 문구로 content 업데이트

UPDATE questions SET content = '사람들이 나를 주목하거나 칭찬해 주지 않으면 견디기 힘들다.' WHERE id = 'n2';
UPDATE questions SET content = '나는 규칙이나 순서가 나에게는 유연하게 적용되어도 된다고 본다.' WHERE id = 'en1';
UPDATE questions SET content = '경쟁자의 약점을 파악해 이용하는 것은 현명한 전략이라고 생각한다.' WHERE id = 'm3';
UPDATE questions SET content = '나는 장기적 결과를 생각하지 않고 당장 하고 싶은 대로 행동하곤 한다.' WHERE id = 'p1';
UPDATE questions SET content = '도덕이나 양심은 약자만이 지키는 것이라고 생각할 때가 있다.' WHERE id = 'md3';
UPDATE questions SET content = '잘난 체하는 사람을 짓밟아 기를 꺾어놓을 때 짜릿한 희열을 느낀다.' WHERE id = 's4';
UPDATE questions SET content = '누군가 나를 무시하면, 반드시 기억했다가 어떤 방식으로든 대가를 치르게 해야 직성이 풀린다.' WHERE id = 'sp4';
UPDATE questions SET content = '지금 선택한 답변들은 나의 실제 성격과 일치한다.' WHERE id = 'v4';
