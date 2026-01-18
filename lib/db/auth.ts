/**
 * 사용자 인증 데이터베이스 (Supabase)
 * KPSY LAB Portal
 */

import crypto from 'crypto';
import { supabase } from './supabase';

// 비밀번호 해싱
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// 비밀번호 검증
function verifyPassword(password: string, hash: string): boolean {
  const [salt, hashValue] = hash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hashValue === verifyHash;
}

// 사용자 인터페이스
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

// 데이터베이스 초기화 (Supabase는 자동으로 테이블 생성)
export async function initAuthDB(): Promise<void> {
  // Supabase는 스키마가 이미 생성되어 있어야 함
  // 여기서는 연결 확인만 수행
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  // 간단한 연결 테스트
  const { error } = await supabase.from('users').select('count').limit(1);
  if (error && error.code !== 'PGRST116') { // PGRST116 = 테이블 없음
    console.warn('Supabase 연결 확인:', error.message);
  }
}

// 회원가입
export async function createUser(username: string, email: string, password: string): Promise<User> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const passwordHash = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email,
      password_hash: passwordHash,
      role: 'user'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`사용자 생성 실패: ${error.message}`);
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role || 'user',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// 이메일로 사용자 조회
export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    password_hash: data.password_hash,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// 사용자명으로 사용자 조회
export async function getUserByUsername(username: string): Promise<User | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, created_at, updated_at')
    .eq('username', username)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role || 'user',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// ID로 사용자 조회
export async function getUserById(id: number): Promise<User | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role || 'user',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// 로그인 검증 (이메일 또는 사용자명으로 로그인 가능)
export async function verifyLogin(identifier: string, password: string): Promise<User | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  let user: (User & { password_hash?: string }) | null = null;

  // 이메일 형식인지 확인 (@ 포함 여부)
  if (identifier.includes('@')) {
    // 이메일로 조회
    user = await getUserByEmail(identifier);
  } else {
    // 사용자명(아이디)로 조회
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', identifier)
      .single();

    if (!error && data) {
      user = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        password_hash: data.password_hash,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }
  }

  // 사용자를 찾지 못했거나 비밀번호 해시가 없으면 null 반환
  if (!user || !user.password_hash) {
    return null;
  }

  // 비밀번호 검증
  if (verifyPassword(password, user.password_hash)) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return null;
}

// 통계 정보 조회
export async function getStatistics(): Promise<{
  totalUsers: number;
  totalMasterUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  // 총 사용자 수
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // 마스터 사용자 수
  const { count: totalMasterUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'master');

  // 오늘 가입한 사용자 수
  const today = new Date().toISOString().split('T')[0];
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00.000Z`);

  // 이번 주 가입한 사용자 수
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: newUsersThisWeek } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  return {
    totalUsers: totalUsers || 0,
    totalMasterUsers: totalMasterUsers || 0,
    newUsersToday: newUsersToday || 0,
    newUsersThisWeek: newUsersThisWeek || 0,
  };
}

// 데이터베이스 초기화 (최초 실행 시)
initAuthDB().catch(console.error);
