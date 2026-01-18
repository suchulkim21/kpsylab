const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'blog_seed.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const posts = JSON.parse(data);
    const missingImage = [];

    posts.forEach((post, index) => {
        if (!post.hasOwnProperty('image')) {
            missingImage.push({
                index: index,
                title: post.title
            });
        }
    });

    if (missingImage.length > 0) {
        console.log(`Found ${missingImage.length} posts missing the 'image' field:`);
        missingImage.forEach(item => {
            console.log(`- Index ${item.index} (Topic ${item.index + 1}): ${item.title}`);
        });
    } else {
        console.log("All posts have the 'image' field.");
    }
} catch (err) {
    console.error("Error reading or parsing JSON:", err);
}
