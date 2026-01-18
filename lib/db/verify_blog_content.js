const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'blog_seed.json');

try {
    const data = fs.readFileSync(seedPath, 'utf8');
    const posts = JSON.parse(data);
    const issues = [];

    const bannedTerms = ['H-L-A', 'Type A', 'h1', 'h2'];

    posts.forEach((post, index) => {
        const content = post.content || "";
        const charCount = content.length;
        const postIssues = [];

        // 1. Length Check
        if (charCount < 3000) {
            postIssues.push(`Length insufficient: ${charCount} chars (Required: 3000+)`);
        }

        // 2. HTML Tag Check
        if (content.includes('<h1>') || content.includes('<h2>')) {
            postIssues.push(`Forbidden tag <h1> or <h2> found`);
        }
        if (!content.includes('<h3>')) {
            postIssues.push(`Missing mandatory tag <h3>`);
        }

        // 3. Banned Terms Check
        bannedTerms.forEach(term => {
            if (content.includes(term)) {
                postIssues.push(`Banned term found: "${term}"`);
            }
        });

        if (postIssues.length > 0) {
            issues.push({
                index: index + 1,
                title: post.title,
                issues: postIssues
            });
        }
    });

    if (issues.length > 0) {
        console.log(`Found issues in ${issues.length} posts.`);
        const showCount = 5;
        issues.slice(0, showCount).forEach(item => {
            console.log(`[Topic ${item.index}] ${item.title}`);
            item.issues.forEach(issue => console.log(`  - ${issue}`));
        });
        if (issues.length > showCount) {
            console.log(`... and ${issues.length - showCount} more posts with issues.`);
        }
    } else {
        console.log("All posts passed basic verification.");
    }

} catch (err) {
    console.error("Error:", err);
}
