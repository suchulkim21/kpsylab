/**
 * 블로그 포스트 생성 스크립트
 * 마크다운 파일을 읽어서 Supabase에 저장
 */

import * as fs from 'fs';
import * as nodePath from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 로드
dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogPostData {
  title: string;
  author: string;
  date: string;
  tags: string;
  image: string;
  content: string;
}

function parseMarkdownFile(filePath: string): BlogPostData | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let title = '';
    let author = '';
    let date = '';
    let tags = '';
    let image = '';
    let contentStart = false;
    let contentLines: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('## 제목')) {
        title = lines[lines.indexOf(line) + 1]?.trim() || '';
      } else if (line.startsWith('## 작성자')) {
        author = lines[lines.indexOf(line) + 1]?.trim() || '';
      } else if (line.startsWith('## 날짜')) {
        date = lines[lines.indexOf(line) + 1]?.trim() || '';
      } else if (line.startsWith('## 태그')) {
        tags = lines[lines.indexOf(line) + 1]?.trim() || '';
      } else if (line.startsWith('## 이미지 경로')) {
        image = lines[lines.indexOf(line) + 1]?.trim() || '';
      } else if (line.startsWith('## 내용')) {
        contentStart = true;
      } else if (contentStart && line.trim() !== '') {
        contentLines.push(line);
      }
    }
    
    return {
      title,
      author,
      date,
      tags,
      image,
      content: contentLines.join('\n'),
    };
  } catch (error) {
    console.error(`파일 읽기 오류: ${filePath}`, error);
    return null;
  }
}

async function createBlogPost(data: BlogPostData) {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: data.title,
        author: data.author,
        date: data.date,
        tags: data.tags.split(',').map(t => t.trim()),
        image: data.image,
        content: data.content,
        published: true,
      });

    if (error) {
      console.error('❌ 포스트 저장 실패:', error);
      return false;
    }

    console.log(`✅ 포스트 저장 완료: ${data.title}`);
    return true;
  } catch (error) {
    console.error('❌ 포스트 저장 오류:', error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (!filePath) {
    console.error('사용법: npx tsx scripts/create-blog-post.ts <마크다운 파일 경로>');
    process.exit(1);
  }

  const fullPath = nodePath.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${fullPath}`);
    process.exit(1);
  }

  const data = parseMarkdownFile(fullPath);
  
  if (!data) {
    console.error('❌ 파일 파싱 실패');
    process.exit(1);
  }

  if (!data.title || !data.content) {
    console.error('❌ 필수 필드가 누락되었습니다.');
    process.exit(1);
  }

  await createBlogPost(data);
}

main().catch(console.error);
