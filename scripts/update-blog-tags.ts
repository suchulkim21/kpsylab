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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseTags(filePath: string): { title: string, tags: string } | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const titleMatch = content.match(/## 제목\s*[\r\n]+([^\r\n]+)/);
        const tagsMatch = content.match(/## 태그\s*[\r\n]+([^\r\n]+)/);

        if (titleMatch && tagsMatch) {
            return {
                title: titleMatch[1].trim(),
                tags: tagsMatch[1].trim()
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    const postsDir = nodePath.join(process.cwd(), 'docs', 'blog_posts_phase1');
    const files = fs.readdirSync(postsDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .map(f => nodePath.join(postsDir, f));

    let updatedCount = 0;

    for (const file of files) {
        const parsed = parseTags(file);
        if (!parsed) continue;

        const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('title', parsed.title)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('blog_posts')
                .update({ tags: parsed.tags })
                .eq('id', existing.id);

            if (error) {
                console.error(`❌ 업데이트 실패: ${parsed.title}`, error);
            } else {
                console.log(`✅ 태그 업데이트됨 [ID: ${existing.id}]: ${parsed.title}`);
                updatedCount++;
            }
        } else {
            console.log(`⚠️ DB에 포스트 없음: ${parsed.title}`);
        }
    }

    console.log(`\n🎉 총 ${updatedCount}개 포스트의 태그/카테고리가 데이터베이스에 반영되었습니다.`);
}

main().catch(console.error);
