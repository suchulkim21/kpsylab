const fs = require('fs');
const path = require('path');

// Usage: node merge_blog_updates.js <update_file.json>
// Run from: apps/portal/lib/db/
const updateFile = process.argv[2];

if (!updateFile) {
    console.error("Please provide an update file path.");
    process.exit(1);
}

const seedPath = path.join(__dirname, 'blog_seed.json');
const updatePath = path.resolve(updateFile);

try {
    // Read main seed file
    const seedData = fs.readFileSync(seedPath, 'utf8');
    let posts = JSON.parse(seedData);

    // Read update file
    // Expected format: [ { index: 0, content: "..." }, { index: 1, content: "..." } ]
    // Index is 0-based index in the blog_seed array
    const updateData = fs.readFileSync(updatePath, 'utf8');
    const updates = JSON.parse(updateData);

    console.log(`Applying ${updates.length} updates...`);

    updates.forEach(update => {
        if (update.index >= 0 && update.index < posts.length) {
            posts[update.index].content = update.content;
            console.log(`Updated Post ${update.index + 1}: ${posts[update.index].title.substring(0, 20)}...`);
        } else {
            console.warn(`Invalid index: ${update.index}`);
        }
    });

    fs.writeFileSync(seedPath, JSON.stringify(posts, null, 4), 'utf8');
    console.log("Successfully updated blog_seed.json");

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
