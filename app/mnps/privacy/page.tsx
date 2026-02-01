import type { Metadata } from 'next';
import LegalPageShell, {
  LegalSection,
  LegalSectionTitle,
} from '../components/LegalPageShell';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | MNPS - KPSY LAB',
  description: 'MNPS(Dark Nature Test) 개인정보 처리방침',
};

export default function MnpsPrivacyPage() {
  return (
    <LegalPageShell
      title="개인정보 처리방침"
      subtitle="MNPS 다크 테스트"
      backLabel="MNPS로 돌아가기"
    >
      {/* 수집 항목 */}
      <LegalSection>
        <LegalSectionTitle>수집하는 정보</LegalSectionTitle>
        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
          본 서비스에서는 아래와 같은 정보를 수집할 수 있습니다. 별도의 회원가입·로그인을
          요구하지 않으며, <strong className="text-zinc-200">이메일·실명·전화번호 등 개인을 식별하는 회원 정보는 수집하지 않습니다.</strong>
        </p>
        <ul className="text-zinc-300 text-sm leading-relaxed space-y-2 list-disc list-inside marker:text-zinc-500">
          <li>테스트 응답 데이터 (문항별 선택 값)</li>
          <li>산출된 점수 및 결과(아키타입, D-Total, 특성 점수 등)</li>
          <li>접속·이용 로그 (접속 시각, 브라우저 정보 등)</li>
        </ul>
      </LegalSection>

      {/* 수집 목적 */}
      <LegalSection>
        <LegalSectionTitle>수집 목적</LegalSectionTitle>
        <ul className="text-zinc-300 text-sm leading-relaxed space-y-2 list-disc list-inside marker:text-zinc-500">
          <li>서비스 제공 및 본인 테스트 결과 분석·표시</li>
          <li>통계 데이터 산출 및 규준(norm) 연구</li>
          <li>알고리즘 및 해석 정확도 개선 (이용 시 익명화·집계 처리 후 활용)</li>
        </ul>
      </LegalSection>

      {/* 보관 기간 */}
      <LegalSection>
        <LegalSectionTitle>보관 기간</LegalSectionTitle>
        <p className="text-zinc-300 text-sm leading-relaxed">
          보관 기간은 법률 자문 후 구체화될 예정입니다. 당장은 기본적으로 사용자가 브라우저
          캐시·세션을 삭제하거나, 데이터 삭제를 요청하실 경우 해당 데이터를 파기·비공개 처리하는
          방향으로 운영할 예정입니다. 구체적인 기간이 정해지면 본 방침을 갱신하여 공지하겠습니다.
        </p>
      </LegalSection>

      {/* 면책 (동일 문구 참고용) */}
      <LegalSection>
        <LegalSectionTitle>면책 조항 (Disclaimer)</LegalSectionTitle>
        <p className="text-zinc-300 text-sm leading-relaxed">
          본 테스트 결과는 심리학적 이론에 기반하였으나,{' '}
          <strong className="text-zinc-200">의학적/임상적 진단을 대체할 수 없습니다.</strong>{' '}
          결과는 자기 성찰 및 오락 목적으로만 이용해 주시고, 심각한 심리적 문제가 의심될 경우
          반드시 전문가와 상담하십시오. 자세한 내용은 이용약관을 참고해 주세요.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
