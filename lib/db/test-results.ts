/**
 * 테스트 결과 데이터베이스 (Supabase)
 * KPSY LAB Portal
 */

import { supabase } from './supabase';

// 데이터베이스 초기화
export async function initTestResultsDB(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  // 연결 테스트
  const { error } = await supabase.from('test_results').select('count').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.warn('Supabase 연결 확인:', error.message);
  }
}

// 테스트 결과 인터페이스
export interface TestResult {
  id: number;
  user_id: number | null;
  test_type: string;
  test_data: any; // JSON
  created_at: string;
}

// 테스트 결과 저장 (회원)
export async function saveTestResult(userId: number, testType: string, testData: any): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('test_results')
    .insert({
      user_id: userId,
      test_type: testType,
      test_data: testData, // Supabase는 JSONB 자동 처리
    })
    .select()
    .single();

  if (error) {
    throw new Error(`테스트 결과 저장 실패: ${error.message}`);
  }

  return data.id;
}

// 사용자의 테스트 결과 조회
export async function getUserTestResults(userId: number, testType?: string): Promise<TestResult[]> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  let query = supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (testType) {
    query = query.eq('test_type', testType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('테스트 결과 조회 실패:', error);
    return [];
  }

  return (data || []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    test_type: r.test_type,
    test_data: r.test_data, // 이미 JSON으로 파싱됨
    created_at: r.created_at,
  }));
}

// 특정 테스트 결과 조회
export async function getTestResult(resultId: number): Promise<TestResult | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    test_type: data.test_type,
    test_data: data.test_data, // 이미 JSON으로 파싱됨
    created_at: data.created_at,
  };
}

// 데이터베이스 초기화
initTestResultsDB().catch(console.error);
