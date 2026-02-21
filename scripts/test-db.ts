import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';
import * as fs from 'fs';

dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await s.from('blog_posts').select('id, title, tags').limit(3);
    if (error) {
        console.error("Fetch error:", error);
        return;
    }
    console.log("DB Posts:", JSON.stringify(data, null, 2));

    const filePath = nodePath.join(process.cwd(), 'docs', 'blog_posts_phase1', '001.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/## 제목\s*[\r\n]+([^\r\n]+)/);
    const tagsMatch = content.match(/## 태그\s*[\r\n]+([^\r\n]+)/);

    console.log("MD File Title:", titleMatch ? titleMatch[1].trim() : "None");
    console.log("MD File Tags:", tagsMatch ? tagsMatch[1].trim() : "None");
}
run();
