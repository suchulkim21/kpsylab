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
  description: 'Dark Tetrad 심리 분석 서비스 - KPSY LAB',
};

export default function MnpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mnps-container min-h-screen ${inter.variable}`}>
      {children}
    </div>
  );
}
