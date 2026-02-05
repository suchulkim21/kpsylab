import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mnps-inter',
  display: 'swap',
});

export const metadata = {
  title: 'MNPS - KPSY LAB',
  description: 'MNPS: 다크 테트라드 독자적 논리 모델 - KPSY LAB',
};

export default function MnpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mnps-container min-h-screen ${inter.variable}`}>
      {children}
    </div>
  );
}
