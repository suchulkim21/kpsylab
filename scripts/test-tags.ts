import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';

dotenv.config({ path: nodePath.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data } = await supabase.from('blog_posts').select('id, title, tags').limit(1);

    // Check how BlogSidebar.tsx parses tags
    const MAIN_CATEGORIES = [
        "마케팅 심리학",
        "인지·뇌과학",
        "마음챙김·치유",
        "성장·자기계발",
        "인간관계·사회",
        "일반 심리학"
    ];

    data.forEach(p => {
        let tagsArray;
        if (Array.isArray(p.tags)) {
            tagsArray = p.tags;
        } else if (typeof p.tags === 'string') {
            tagsArray = p.tags.split(',').map(t => t.trim());
        } else {
            tagsArray = [];
        }

        console.log(`[Post ID ${p.id}] Original tags:`, typeof p.tags, p.tags);
        console.log(`[Post ID ${p.id}] Parsed array:`, tagsArray);

        const firstTag = tagsArray[0];
        const targetCategory = "성장·자기계발";

        console.log("firstTag:", firstTag, "length:", firstTag.length);
        console.log("targetCat:", targetCategory, "length:", targetCategory.length);

        console.log("firstTag chars:", [...firstTag].map(c => c.charCodeAt(0).toString(16)));
        console.log("targetCat chars:", [...targetCategory].map(c => c.charCodeAt(0).toString(16)));

        console.log("Exact match?:", firstTag === targetCategory);
    });
}
run();
