"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS } from "../../data/module2/scenarios";
import { Scenario, ScenarioOption } from "../../types/module2";
import { calculateIntermediateResult } from "../../lib/module2/analysis";
import IntermediateResult from "./IntermediateResult";

export default function ScenarioTester() {
    const router = useRouter();
    const [currentPhase, setCurrentPhase] = useState(1);
    const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
    const [selections, setSelections] = useState<ScenarioOption[]>([]);

    // Phase 1: 0-8 (9 items)
    // Phase 2: 9-17 (9 items)
    // Phase 3: 18-26 (9 items)
    const [phaseScenarios, setPhaseScenarios] = useState<Scenario[]>([]);

    const [intermediateResult, setIntermediateResult] = useState<any>(null);
    const [showIntermediate, setShowIntermediate] = useState(false);

    // Initialize or Update Scenarios based on Phase
    useEffect(() => {
        const startIdx = (currentPhase - 1) * 9;
        const endIdx = startIdx + 9;
        setPhaseScenarios(SCENARIOS.slice(startIdx, endIdx));
        setCurrentScenarioIdx(0);
        setIntermediateResult(null);
        setShowIntermediate(false);
    }, [currentPhase]);

    const handleOptionSelect = (option: ScenarioOption) => {
        const newSelections = [...selections, option];
        setSelections(newSelections);

        if (currentScenarioIdx < phaseScenarios.length - 1) {
            setCurrentScenarioIdx(prev => prev + 1);
        } else {
            // Phase Complete
            const result = calculateIntermediateResult(currentPhase, newSelections);
            setIntermediateResult(result);
            setShowIntermediate(true);
        }
    };

    const handleNextPhase = () => {
        if (currentPhase < 3) {
            setCurrentPhase(prev => prev + 1);
        } else {
            // All Phases Complete - Save & Navigate
            // Logic: Combine all intermediate results or just save final raw selection?
            // The original logic likely saved a comprehensive object.
            // Let's assume we save the final result object similar to what calculateIntermediateResult returns + raw data.

            // Re-calculate final analysis vector (sum of all selections)
            // But for now, let's just save the current detailed result and navigate.
            // Wait, the new 'page.tsx' logic (which I updated then reverted) expects 'sg_module2_result'.
            // The Reverted page.tsx expects { analysis: ... } or similar.

            // Let's aggregate total scores for the final save.
            const totalScores = { proactivity: 0, adaptability: 0, socialDistance: 0 };
            selections.forEach(opt => {
                if (opt.weight.proactivity) totalScores.proactivity += opt.weight.proactivity;
                if (opt.weight.adaptability) totalScores.adaptability += opt.weight.adaptability;
                if (opt.weight.socialDistance) totalScores.socialDistance += opt.weight.socialDistance;
            });

            const resultData = {
                timestamp: new Date().toISOString(),
                analysis: totalScores, // Compatible with reverted Result Page
                scores: totalScores, // Added for extra robustness
                rawSelections: selections
            };
            localStorage.setItem('sg_module2_result', JSON.stringify(resultData));
            router.push('/second-genesis/module2/result');
        }
    };

    if (showIntermediate && intermediateResult) {
        return (
            <IntermediateResult
                phase={currentPhase}
                result={intermediateResult}
                onNext={handleNextPhase}
            />
        );
    }

    const currentScenario = phaseScenarios[currentScenarioIdx];
    if (!currentScenario) return <div>Loading...</div>;

    // Calculate progress for current phase
    const progress = Math.round(((currentScenarioIdx + 1) / phaseScenarios.length) * 100);

    return (
        <div style={{ width: '100%', maxWidth: '56rem', margin: '0 auto', padding: '1rem' }} className="animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Phase 0{currentPhase} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>// 시나리오 분석</span>
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#4ade80', fontSize: '0.875rem' }}>
                        {currentScenarioIdx + 1} / {phaseScenarios.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#374151', borderRadius: '2px', marginBottom: '3rem' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            {/* Scenario Card */}
            <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(75, 85, 99, 0.4)', padding: '2.5rem', borderRadius: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '1.35rem', color: 'white', marginBottom: '2.5rem', lineHeight: '1.6', fontWeight: '500' }}>
                    {currentScenario.situation}
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {currentScenario.options?.map((opt, idx) => (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt)}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                textAlign: 'left',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                color: '#e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <div style={{ fontSize: '1.1rem' }}>{opt.text}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
