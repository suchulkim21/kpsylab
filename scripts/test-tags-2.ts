import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';

dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await s.from('blog_posts').select('id, title, tags').limit(1);
    const post = data[0];
    console.log("Raw tags from DB:", post.tags);
    console.log("Type of tags in DB:", typeof post.tags, Array.isArray(post.tags) ? 'Array' : 'Not Array');

    // How Sidebar processes tags
    const MAIN_CATEGORIES = ["마케팅 심리학", "인지·뇌과학", "마음챙김·치유", "성장·자기계발", "인간관계·사회", "일반 심리학"];
    const tagsArr = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []);
    console.log("tagsArr processed by Sidebar:", tagsArr);

    // Check if any tag matches MAIN_CATEGORIES
    const matched = tagsArr.filter(t => MAIN_CATEGORIES.includes(t));
    console.log("Matched categories:", matched);
}
run();
