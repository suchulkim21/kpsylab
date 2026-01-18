'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function DisclaimerFooter() {
    const { language } = useLanguage();

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 pt-6 border-t border-gray-900 text-center opacity-70 hover:opacity-100 transition-opacity duration-500">
            <p className="text-xs md:text-sm text-gray-400 font-mono leading-relaxed">
                {language === 'ko'
                    ? "본 시스템은 '임상 심리학 및 스트레스 대처 모델'을 기반으로 설계되었으며, 전문적인 의학적 진단 도구는 아닙니다."
                    : "This system is based on 'Clinical Psychology & Stress Coping Models' but is not a medical diagnostic tool."}
                <br className="md:hidden" />
                {language === 'ko'
                    ? " 결과에 대한 맹신을 금하며, 심각한 심리적 고통이 있는 경우 반드시 전문가의 도움을 받으십시오."
                    : " Do not rely blindly on results; seek professional help if experiencing severe psychological distress."}
            </p>
            <p className="text-[10px] md:text-xs text-gray-600 mt-2 uppercase tracking-widest">
                © SECOND GENESIS INSTITUTE. NON-COMMERCIAL PROTOCOL.
            </p>
        </div>
    );
}
