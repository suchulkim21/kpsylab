// count-missing-images.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { console.error('Supabase env missing'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);
async function countMissing() {
    const { data, error, count } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .or('image.is.null,image.eq.');
    if (error) { console.error('Count error', error.message); process.exit(1); }
    console.log('Missing images count:', count);
}
countMissing().then(() => process.exit(0));
