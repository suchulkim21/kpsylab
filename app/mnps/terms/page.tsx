import type { Metadata } from 'next';
import LegalPageShell, {
  LegalSection,
  LegalSectionTitle,
} from '../components/LegalPageShell';

export const metadata: Metadata = {
  title: '이용약관 | MNPS - KPSY LAB',
  description: 'MNPS 다크 테스트 이용약관',
};

export default function MnpsTermsPage() {
  return (
    <LegalPageShell
      title="이용약관"
      subtitle="MNPS 다크 테스트"
      backLabel="MNPS로 돌아가기"
    >
      {/* 베타 서비스 안내 */}
      <LegalSection>
        <LegalSectionTitle>베타 서비스 안내</LegalSectionTitle>
        <p className="text-zinc-300 text-sm leading-relaxed">
          본 서비스는 현재 <strong className="text-zinc-200">베타 테스트</strong> 중입니다.
          서비스 기능, 정책, 이용약관 및 개인정보 처리방침이 예고 없이 변경될 수 있으며,
          변경 시 최대한 서비스 내 공지 등으로 안내할 예정입니다.
        </p>
      </LegalSection>

      {/* 면책 조항 (필수) */}
      <LegalSection>
        <LegalSectionTitle>면책 조항 (Disclaimer)</LegalSectionTitle>
        <ul className="text-zinc-300 text-sm leading-relaxed space-y-3 list-disc list-inside marker:text-zinc-500">
          <li>
            본 테스트 결과는 심리학적 이론에 기반하였으나,{' '}
            <strong className="text-zinc-200">의학적/임상적 진단을 대체할 수 없습니다.</strong>
          </li>
          <li>
            결과는 오직 <strong className="text-zinc-200">자기 성찰 및 오락 목적</strong>으로만
            사용되어야 하며, 심각한 심리적 문제가 의심될 경우 반드시 전문가와 상담하십시오.
          </li>
        </ul>
      </LegalSection>

      {/* 저작권 */}
      <LegalSection>
        <LegalSectionTitle>저작권</LegalSectionTitle>
        <p className="text-zinc-300 text-sm leading-relaxed">
          본 서비스의 콘텐츠(텍스트, 해석, 문항, 리포트 등) 및 로고·디자인에 대한 무단 복제,
          배포, 전송, 수정, 2차적 저작물 작성은 금지됩니다. 개인적인 참고 목적의 저장·열람은
          허용될 수 있으나, 상업적 이용 및 외부 재배포는 허용되지 않습니다.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
