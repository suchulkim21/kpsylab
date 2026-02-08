import { redirect } from 'next/navigation';

/**
 * /mnps 진입 시 테스트 시작 페이지로 리다이렉트
 * 서비스 소개 등에서 /mnps 링크 사용 시 404 방지
 */
export default function MnpsIndexPage() {
  redirect('/mnps/test');
}
