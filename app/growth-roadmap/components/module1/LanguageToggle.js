'use client';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function LanguageToggle() {
    const router = useRouter(); // Need to import useRouter
    const { language, toggleLanguage } = useLanguage();

    return (
        <div className="fixed top-8 right-8 z-50 flex gap-4">
            <button
                onClick={() => router.push('/')}
                className="border border-white/50 bg-black/50 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest"
            >
                {language === 'ko' ? '처음' : 'HOME'}
            </button>
            <button
                onClick={toggleLanguage}
                className="border border-white/50 bg-black/50 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest"
            >
                {language === 'ko' ? 'English' : '한국어'}
            </button>
        </div>
    );
}
