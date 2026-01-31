import * as fs from 'fs';
import * as nodePath from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// .env.local 로드
dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogPost {
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image: string;
}

// 마크다운 파일 파싱
function parseMarkdownFile(filePath: string): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 제목 추출
    const titleMatch = content.match(/## 제목\s*\n(.+)/);
    if (!titleMatch) {
      console.error(`❌ 제목을 찾을 수 없습니다: ${filePath}`);
      return null;
    }
    const title = titleMatch[1].trim();

    // 작성자 추출
    const authorMatch = content.match(/## 작성자\s*\n(.+)/);
    const author = authorMatch ? authorMatch[1].trim() : 'KPSY LAB';

    // 날짜 추출
    const dateMatch = content.match(/## 날짜\s*\n(.+)/);
    if (!dateMatch) {
      console.error(`❌ 날짜를 찾을 수 없습니다: ${filePath}`);
      return null;
    }
    const date = dateMatch[1].trim();

    // 태그 추출
    const tagsMatch = content.match(/## 태그\s*\n(.+)/);
    const tags = tagsMatch ? tagsMatch[1].trim() : '';

    // 이미지 경로 추출
    const imageMatch = content.match(/## 이미지 경로\s*\n(.+)/);
    const image = imageMatch ? imageMatch[1].trim() : '';

    // 내용 추출 (## 내용 이후부터 끝까지)
    const contentMatch = content.match(/## 내용\s*\n([\s\S]+)/);
    if (!contentMatch) {
      console.error(`❌ 내용을 찾을 수 없습니다: ${filePath}`);
      return null;
    }
    const htmlContent = contentMatch[1].trim();

    return {
      title,
      content: htmlContent,
      author,
      date,
      tags,
      image
    };
  } catch (error) {
    console.error(`❌ 파일 읽기 오류: ${filePath}`, error);
    return null;
  }
}

// 데이터베이스에 업로드
async function uploadPost(post: BlogPost, index: number): Promise<boolean> {
  try {
    // 중복 체크 (제목으로)
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('title', post.title)
      .single();

    if (existing) {
      console.log(`⏭️  건너뜀 (중복): ${post.title}`);
      return false;
    }

    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        content: post.content,
        author: post.author,
        date: post.date,
        tags: post.tags || null,
        image: post.image || null
      });

    if (error) {
      console.error(`❌ 업로드 실패: ${post.title}`, error.message);
      return false;
    }

    console.log(`✅ 업로드 완료 [${index}]: ${post.title}`);
    return true;
  } catch (error) {
    console.error(`❌ 업로드 오류: ${post.title}`, error);
    return false;
  }
}

// 메인 실행
async function main() {
  const postsDir = nodePath.join(process.cwd(), 'docs', 'blog_posts_phase1');
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => nodePath.join(postsDir, f));

  console.log(`📚 총 ${files.length}개 파일 발견\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const post = parseMarkdownFile(file);

    if (!post) {
      errorCount++;
      continue;
    }

    const result = await uploadPost(post, i + 1);
    if (result) {
      successCount++;
    } else {
      skipCount++;
    }

    // API 레이트 리밋 방지를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 업로드 완료:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ⏭️  건너뜀: ${skipCount}개`);
  console.log(`   ❌ 오류: ${errorCount}개`);
  console.log(`   📝 총: ${files.length}개`);
}

main().catch(console.error);
