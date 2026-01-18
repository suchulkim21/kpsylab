/**
 * 게시판 데이터베이스 (Supabase)
 * KPSY LAB Portal
 */

import { supabase } from './supabase';

// 데이터베이스 초기화
export async function initBoardDB(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  // 연결 테스트
  const { error } = await supabase.from('board_posts').select('count').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.warn('Supabase 연결 확인:', error.message);
  }
}

// 게시글 인터페이스
export interface BoardPost {
  id: number;
  title: string;
  content: string;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

// 모든 게시글 조회 (페이지네이션)
export async function getPosts(limit: number = 20, offset: number = 0): Promise<BoardPost[]> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('board_posts')
    .select('*')
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('게시글 조회 실패:', error);
    return [];
  }

  return (data || []).map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    views: post.views || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }));
}

// 게시글 개수 조회
export async function getPostCount(): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { count, error } = await supabase
    .from('board_posts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('게시글 개수 조회 실패:', error);
    return 0;
  }

  return count || 0;
}

// 단일 게시글 조회
export async function getPost(id: number): Promise<BoardPost | null> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('board_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    author: data.author,
    views: data.views || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// 조회수 증가
export async function incrementViews(id: number): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { error } = await supabase.rpc('increment_views', { post_id: id });
  
  // RPC 함수가 없으면 직접 업데이트
  if (error && error.code === '42883') {
    const post = await getPost(id);
    if (post) {
      await supabase
        .from('board_posts')
        .update({ views: post.views + 1 })
        .eq('id', id);
    }
  }
}

// 게시글 생성
export async function createPost(title: string, content: string, author: string): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('board_posts')
    .insert({
      title,
      content,
      author,
      views: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`게시글 생성 실패: ${error.message}`);
  }

  return data.id;
}

// 게시글 수정
export async function updatePost(id: number, title: string, content: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { error } = await supabase
    .from('board_posts')
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('게시글 수정 실패:', error);
    return false;
  }

  return true;
}

// 게시글 삭제
export async function deletePost(id: number): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }

  const { error } = await supabase
    .from('board_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('게시글 삭제 실패:', error);
    return false;
  }

  return true;
}

// 데이터베이스 초기화
initBoardDB().catch(console.error);
