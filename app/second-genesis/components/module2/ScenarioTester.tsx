"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS } from "@second-genesis/data/module2/scenarios";
import { Scenario, ScenarioOption } from "@second-genesis/types/module2";
import { calculateIntermediateResult } from "@second-genesis/lib/module2/analysis";
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
    const [phaseSelections, setPhaseSelections] = useState<{
        phase1: ScenarioOption[];
        phase2: ScenarioOption[];
        phase3: ScenarioOption[];
    }>({ phase1: [], phase2: [], phase3: [] });

    // Initialize or Update Scenarios based on Phase
    useEffect(() => {
        const startIdx = (currentPhase - 1) * 9;
        const endIdx = startIdx + 9;
        setPhaseScenarios(SCENARIOS.slice(startIdx, endIdx));
        setCurrentScenarioIdx(0);
        setIntermediateResult(null);
        setShowIntermediate(false);
        // Phase가 바뀔 때 selections 초기화 (새 Phase 시작)
        if (currentPhase > 1) {
            setSelections([]);
        }
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
            
            // 현재 Phase의 선택 저장
            if (currentPhase === 1) {
                setPhaseSelections(prev => ({ ...prev, phase1: newSelections }));
            } else if (currentPhase === 2) {
                setPhaseSelections(prev => ({ ...prev, phase2: newSelections }));
            } else if (currentPhase === 3) {
                setPhaseSelections(prev => ({ ...prev, phase3: newSelections }));
            }
        }
    };

    const handleNextPhase = () => {
        if (currentPhase < 3) {
            // 현재 Phase의 선택을 저장
            const currentPhaseSelections = selections.slice();
            if (currentPhase === 1) {
                setPhaseSelections(prev => ({ ...prev, phase1: currentPhaseSelections }));
            } else if (currentPhase === 2) {
                setPhaseSelections(prev => ({ ...prev, phase2: currentPhaseSelections }));
            }
            
            setCurrentPhase(prev => prev + 1);
        } else {
            // Phase 3 완료 - 최종 저장
            const finalPhaseSelections = { ...phaseSelections, phase3: selections };
            
            // Phase별 선택 분리
            const phase1Selections = finalPhaseSelections.phase1;
            const phase2Selections = finalPhaseSelections.phase2;
            const phase3Selections = finalPhaseSelections.phase3;
            
            // 모든 선택 합치기
            const allSelections = [...phase1Selections, ...phase2Selections, ...phase3Selections];
            
            // 일관성 검증 (비동기)
            import('@second-genesis/lib/module2/consistencyCheck').then(({ checkAnswerConsistency }) => {
                const consistencyResult = checkAnswerConsistency(allSelections, finalPhaseSelections);
                
                const totalScores = { proactivity: 0, adaptability: 0, socialDistance: 0 };
                allSelections.forEach(opt => {
                    if (opt.weight.proactivity) totalScores.proactivity += opt.weight.proactivity;
                    if (opt.weight.adaptability) totalScores.adaptability += opt.weight.adaptability;
                    if (opt.weight.socialDistance) totalScores.socialDistance += opt.weight.socialDistance;
                });

                const resultData = {
                    timestamp: new Date().toISOString(),
                    analysis: totalScores,
                    scores: totalScores,
                    rawSelections: allSelections,
                    consistency: consistencyResult,
                    phaseSelections: finalPhaseSelections
                };
                localStorage.setItem('sg_module2_result', JSON.stringify(resultData));
                router.push('/second-genesis/module2/result');
            });
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
