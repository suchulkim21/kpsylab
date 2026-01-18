import './globals.css';

export const metadata = {
    title: 'MNPS - KPSY LAB',
    description: 'Dark Tetrad 심리 분석 서비스 - KPSY LAB',
};

export default function MnpsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mnps-container min-h-screen">
            {children}
        </div>
    );
}
