// test-fill-missing-images.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { console.error('Supabase env missing'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);
async function countMissing() {
    const { data, error } = await supabase.from('blog_posts').select('id', { count: 'exact', head: true }).or('image.is.null,image.eq.');
    if (error) { console.error('Count error', error.message); process.exit(1); }
    console.log('Missing images count:', data?.length ?? 0);
}
(async () => {
    console.log('Before fill:');
    await countMissing();
    console.log('Running fill script...');
    const { exec } = require('child_process');
    exec('node scripts/fill-missing-images.js', (err, stdout, stderr) => {
        if (err) { console.error('Fill script error', err); }
        console.log(stdout);
        console.error(stderr);
        console.log('After fill:');
        countMissing().then(() => process.exit(0));
    });
})();
