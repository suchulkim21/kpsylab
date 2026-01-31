import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';
import * as fs from 'fs';

// .env.local 로드
dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogImages() {
  try {
    // 데이터베이스에서 포스트 가져오기
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, image')
      .order('id', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ 오류:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('📭 블로그 포스트가 없습니다.');
      return;
    }

    console.log(`\n📊 이미지 경로 확인 (처음 10개 포스트)\n`);

    // public/images/blog 폴더 확인
    const imageDir = nodePath.join(process.cwd(), 'public', 'images', 'blog');
    const imageDirExists = fs.existsSync(imageDir);
    const imageFiles = imageDirExists ? fs.readdirSync(imageDir) : [];

    console.log(`📁 이미지 폴더: ${imageDir}`);
    console.log(`   존재 여부: ${imageDirExists ? '✅ 존재' : '❌ 없음'}`);
    console.log(`   파일 개수: ${imageFiles.length}개\n`);

    if (imageFiles.length > 0) {
      console.log(`   파일 목록 (처음 10개):`);
      imageFiles.slice(0, 10).forEach(file => {
        console.log(`     - ${file}`);
      });
      console.log('');
    }

    // 포스트별 이미지 경로 확인
    posts.forEach((post, index) => {
      const imagePath = post.image || '';
      const isLocalPath = imagePath.startsWith('/images/blog/');
      const imageFileName = imagePath.replace('/images/blog/', '');
      const imageFilePath = nodePath.join(imageDir, imageFileName);
      const imageFileExists = fs.existsSync(imageFilePath);

      console.log(`${index + 1}. ID: ${post.id} - ${post.title.substring(0, 40)}...`);
      console.log(`   이미지 경로: ${imagePath || '(없음)'}`);
      console.log(`   로컬 경로: ${isLocalPath ? '✅' : '❌'}`);
      console.log(`   파일 존재: ${imageFileExists ? '✅' : '❌'}`);
      if (imagePath && !imageFileExists && isLocalPath) {
        console.log(`   ⚠️  파일이 없습니다: ${imageFilePath}`);
      }
      console.log('');
    });

    // 통계
    const postsWithImages = posts.filter(p => p.image && p.image.trim() !== '');
    const postsWithLocalImages = posts.filter(p => p.image && p.image.startsWith('/images/blog/'));
    const missingImages = postsWithLocalImages.filter(p => {
      const fileName = p.image.replace('/images/blog/', '');
      const filePath = nodePath.join(imageDir, fileName);
      return !fs.existsSync(filePath);
    });

    console.log(`\n📊 통계:`);
    console.log(`   총 포스트: ${posts.length}개`);
    console.log(`   이미지 있는 포스트: ${postsWithImages.length}개`);
    console.log(`   로컬 경로 포스트: ${postsWithLocalImages.length}개`);
    console.log(`   파일 없는 포스트: ${missingImages.length}개`);

    if (missingImages.length > 0) {
      console.log(`\n⚠️  파일이 없는 이미지 경로:`);
      missingImages.slice(0, 5).forEach(p => {
        console.log(`   - ${p.image} (ID: ${p.id})`);
      });
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkBlogImages();
