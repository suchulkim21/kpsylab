/**
 * Centralized State Store: user_global_vector
 * 재검사 시 전역 프로필을 단일 소스로 관리하고, 모듈별 dirty flag로 재합성 시점 제어
 * + Global Master Vector: 통합 가중치, module_history, consistency_score
 */

import type { MasterVector } from "./masterVector";
import {
  projectM1ToLatent,
  projectM2ToLatent,
  synthesizeMasterVector,
  latentToMasterVector,
  computeConsistencyScore,
  computeRetestConsistency,
  DEFAULT_MASTER,
} from "./masterVector";
import { analyzePsychologicalDynamics } from "@/lib/services/psychologicalDynamics";
import { markDependentsDirty } from "@/lib/services/causalMap";

const STORAGE_KEY = "sg_global_profile";

export interface M1VectorData {
  dominantType: string;
  vector: Record<string, number | string>;
  timestamp: string;
  isRetest?: boolean;
  previousType?: string; // 재검사 시 이전 dominantType
}

export interface ModuleHistoryEntry {
  moduleId: string;
  timestamp: string;
  result: Record<string, unknown>;
  dominantType?: string;
}

export interface GlobalProfile {
  m1?: M1VectorData;
  m2?: { timestamp: string; typeCode?: string; scores?: { p: number; a: number; sd: number }; [key: string]: unknown };
  m3?: { timestamp: string; [key: string]: unknown };
  completedModules: string[];
  dirtyFlags: Record<string, boolean>;
  lastRetestModule?: string;
  /** V2: Master Vector */
  master_vector?: MasterVector;
  module_history?: ModuleHistoryEntry[];
  consistency_score?: number;
  /** C < 0.6 시 true (심리적 성장/상황적 페르소나) */
  anomaly?: boolean;
  /** Differentiation 기반 내러티브 (anomaly 시) */
  anomalyNarrative?: string;
}

type Listener = (profile: GlobalProfile) => void;
const listeners = new Set<Listener>();

function load(): GlobalProfile {
  if (typeof window === "undefined") {
    return { completedModules: [], dirtyFlags: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
  return {
    ...parsed,
    dirtyFlags: parsed.dirtyFlags ?? {},
    completedModules: parsed.completedModules ?? [],
    module_history: parsed.module_history ?? [],
  };
    }
  } catch {}
  return { completedModules: [], dirtyFlags: {} };
}

function save(profile: GlobalProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    listeners.forEach((fn) => fn(profile));
  } catch {}
}

/** 전역 프로필 조회 */
export function getGlobalProfile(): GlobalProfile {
  return load();
}

/** M1 결과를 전역 프로필에 반영 (재검사 시 아카이브 + Master Vector 갱신) */
export function updateM1Global(
  data: { dominantType: string; vector: Record<string, number | string> },
  options?: { isRetest?: boolean; previousType?: string }
): GlobalProfile {
  const profile = load();
  const vectorNum = Object.fromEntries(
    Object.entries(data.vector ?? {}).map(([k, v]) => [k, Number(v) || 0])
  ) as Record<string, number>;

  const prevM1 = profile.m1;
  if (options?.isRetest && prevM1) {
    profile.module_history = profile.module_history ?? [];
    profile.module_history.push({
      moduleId: "Module_1",
      timestamp: prevM1.timestamp,
      result: { ...prevM1 },
      dominantType: prevM1.dominantType,
    });
  }

  const now = new Date().toISOString();
  profile.m1 = {
    dominantType: data.dominantType,
    vector: data.vector,
    timestamp: now,
    isRetest: options?.isRetest ?? false,
    previousType: options?.previousType,
  };

  if (options?.isRetest && prevM1) {
    const prevVector = prevM1.vector as Record<string, number>;
    const retestResult = computeRetestConsistency(prevVector, data.vector);
    profile.anomaly = retestResult.isAnomaly;
    profile.consistency_score = retestResult.consistencyScore;
    if (retestResult.isAnomaly) {
      const vOld = projectM1ToLatent(prevVector);
      const vNew = projectM1ToLatent(data.vector);
      const deltaMs = Date.now() - new Date(prevM1.timestamp).getTime();
      const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
      const dynamics = analyzePsychologicalDynamics(vOld, vNew, deltaDays);
      profile.anomalyNarrative = dynamics?.narrative.narrative;
    } else {
      profile.anomalyNarrative = undefined;
    }
  } else {
    profile.anomaly = false;
    profile.anomalyNarrative = undefined;
    const m2Scores = profile.m2?.scores ?? { p: 50, a: 50, sd: 50 };
    profile.consistency_score = computeConsistencyScore(
      { dominantType: data.dominantType, vector: vectorNum },
      profile.m2 ? { typeCode: profile.m2.typeCode ?? "", scores: m2Scores } : undefined
    );
  }

  const contributions: Array<{ moduleId: string; vector: import("./masterVector").LatentVector; timestamp: string }> = [
    { moduleId: "Module_1", vector: projectM1ToLatent(data.vector), timestamp: now },
  ];
  const m2 = profile.m2;
  if (m2?.scores && m2?.timestamp) {
    contributions.push({
      moduleId: "Module_2",
      vector: projectM2ToLatent({ proactivity: m2.scores.p, adaptability: m2.scores.a, socialDistance: m2.scores.sd }),
      timestamp: m2.timestamp,
    });
  }
  profile.master_vector = latentToMasterVector(synthesizeMasterVector(contributions));

  if (!profile.completedModules.includes("Module_1")) {
    profile.completedModules = [...profile.completedModules, "Module_1"];
  }
  if (options?.isRetest) {
    profile.lastRetestModule = "Module_1";
    markDependentsDirty((key) => {
      profile.dirtyFlags = { ...profile.dirtyFlags, [key]: true };
    }, "Module_1");
  }
  save(profile);
  return profile;
}

/** 모듈별 dirty flag 설정 (재합성 필요 표시) */
export function setDirty(moduleKey: string): void {
  const profile = load();
  profile.dirtyFlags = { ...profile.dirtyFlags, [moduleKey]: true };
  save(profile);
}

/** dirty flag 소비 (재합성 후 호출) */
export function clearDirty(moduleKey: string): void {
  const profile = load();
  profile.dirtyFlags = { ...profile.dirtyFlags, [moduleKey]: false };
  save(profile);
}

/** 해당 모듈 재합성 필요 여부 */
export function isDirty(moduleKey: string): boolean {
  return load().dirtyFlags[moduleKey] ?? false;
}

/** Observer: 프로필 변경 시 콜백 등록 */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Master Vector 조회 (없으면 가중치 합성으로 계산) */
export function getMasterVector(): MasterVector {
  const profile = load();
  if (profile.master_vector) return profile.master_vector;
  const contributions: Array<{ moduleId: string; vector: import("./masterVector").LatentVector; timestamp: string }> = [];
  if (profile.m1) {
    contributions.push({
      moduleId: "Module_1",
      vector: projectM1ToLatent(profile.m1.vector),
      timestamp: profile.m1.timestamp,
    });
  }
  if (profile.m2?.scores && profile.m2?.timestamp) {
    const s = profile.m2.scores;
    contributions.push({
      moduleId: "Module_2",
      vector: projectM2ToLatent({ proactivity: s.p, adaptability: s.a, socialDistance: s.sd }),
      timestamp: profile.m2.timestamp,
    });
  }
  if (contributions.length === 0) return DEFAULT_MASTER;
  return latentToMasterVector(synthesizeMasterVector(contributions));
}

/** M2 결과를 전역 프로필에 반영 (가중치 합성 공식 적용) */
export function updateM2Global(data: {
  typeCode: string;
  scores: { p: number; a: number; sd: number };
}): GlobalProfile {
  const profile = load();
  const now = new Date().toISOString();
  profile.m2 = {
    ...profile.m2,
    typeCode: data.typeCode,
    scores: data.scores,
    timestamp: now,
  };
  if (!profile.completedModules.includes("Module_2")) {
    profile.completedModules = [...profile.completedModules, "Module_2"];
  }
  const contributions: Array<{ moduleId: string; vector: import("./masterVector").LatentVector; timestamp: string }> = [];
  if (profile.m1) {
    contributions.push({
      moduleId: "Module_1",
      vector: projectM1ToLatent(profile.m1.vector),
      timestamp: profile.m1.timestamp,
    });
  }
  contributions.push({
    moduleId: "Module_2",
    vector: projectM2ToLatent({
      proactivity: data.scores.p,
      adaptability: data.scores.a,
      socialDistance: data.scores.sd,
    }),
    timestamp: now,
  });
  profile.master_vector = latentToMasterVector(synthesizeMasterVector(contributions));
  const m1 = profile.m1;
  const m1Vec = m1?.vector
    ? (Object.fromEntries(Object.entries(m1.vector).map(([k, v]) => [k, Number(v) || 0])) as Record<string, number>)
    : undefined;
  profile.consistency_score = computeConsistencyScore(
    m1 && m1Vec ? { dominantType: m1.dominantType, vector: m1Vec } : undefined,
    { typeCode: data.typeCode, scores: data.scores }
  );
  save(profile);
  return profile;
}
