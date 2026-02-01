/**
 * 인과관계 맵 (Causal Mapping)
 * 특정 모듈(A) 재검사 시 반드시 재계산/재렌더링되어야 하는 연관 모듈(B, C) 정의
 */

export const CAUSAL_DEPS: Record<string, string[]> = {
  Module_1: ["Module_2", "Module_3"],
  Module_2: ["Module_3"],
  Module_3: [],
};

/** 모듈 X가 변경되면 dirty 되어야 할 모듈 목록 */
export function getDependentModules(moduleId: string): string[] {
  return CAUSAL_DEPS[moduleId] ?? [];
}

/** dirty flag 키 (저장소용) */
export function toDirtyKey(moduleId: string): string {
  const map: Record<string, string> = {
    Module_1: "m1",
    Module_2: "m2",
    Module_3: "m3",
  };
  return map[moduleId] ?? moduleId.toLowerCase();
}

/** 재검사 완료 시 모든 종속 모듈에 dirty flag 설정 */
export function markDependentsDirty(
  setDirtyFn: (key: string) => void,
  sourceModuleId: string
): void {
  const deps = getDependentModules(sourceModuleId);
  deps.forEach((dep) => setDirtyFn(toDirtyKey(dep)));
}
