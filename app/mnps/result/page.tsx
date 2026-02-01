import type { Metadata } from 'next';
import MnpsResultClient from './MnpsResultClient';

type Props = { searchParams: Promise<{ assessmentId?: string }> };

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:7777';
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const assessmentId = sp?.assessmentId;

  if (!assessmentId) {
    return { title: 'MNPS 결과 | KPSY LAB' };
  }

  const baseUrl = getBaseUrl();
  const ogImageUrl = `${baseUrl}/api/og?assessmentId=${assessmentId}`;

  return {
    title: 'MNPS 결과 | KPSY LAB',
    description: 'MNPS 다크 테스트 - 나의 다크 테트라드 프로필 결과',
    openGraph: {
      title: 'MNPS: 나의 다크 테트라드 결과',
      description: 'MNPS 다크 테스트 - 나의 다크 테트라드 프로필 결과',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'MNPS 결과' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MNPS: 나의 다크 테트라드 결과',
      images: [ogImageUrl],
    },
  };
}

export default function MnpsResultPage() {
  return <MnpsResultClient />;
}
