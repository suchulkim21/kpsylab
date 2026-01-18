const fs = require('fs');
const path = require('path');
const https = require('https');

const seedPath = path.join(__dirname, 'blog_seed.json');
// Relative path from apps/portal/lib/db to apps/portal/public/images/blog
const imagesDir = path.join(__dirname, '../../public/images/blog');

console.log("Seed Path:", seedPath);
console.log("Images Dir:", imagesDir);

// Ensure image directory exists
if (!fs.existsSync(imagesDir)) {
    try {
        fs.mkdirSync(imagesDir, { recursive: true });
        console.log("Created images directory.");
    } catch (e) {
        console.error("Failed to create directory:", e);
        process.exit(1);
    }
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else if (res.statusCode === 302 || res.statusCode === 301) {
                if (res.headers.location) {
                    downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                } else {
                    reject(new Error("Redirect with no location"));
                }
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

async function processImages() {
    try {
        const data = fs.readFileSync(seedPath, 'utf8');
        let posts = JSON.parse(data);

        console.log(`Processing ${posts.length} posts...`);

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const id = String(i + 1).padStart(3, '0');
            const filename = `topic_${id}.jpg`;
            // Web path for the JSON
            const localPath = `/images/blog/${filename}`;
            // Filesystem path for saving
            const fullSavePath = path.join(imagesDir, filename);

            // Lorem Picsum URL with valid seed
            const imageUrl = `https://picsum.photos/seed/${i + 1}/800/450`;

            process.stdout.write(`Downloading ${id}... `);

            try {
                await downloadImage(imageUrl, fullSavePath);
                post.image = localPath;
                // console.log("OK"); 
            } catch (e) {
                console.error(`Failed: ${e.message}`);
            }
        }

        fs.writeFileSync(seedPath, JSON.stringify(posts, null, 4), 'utf8');
        console.log("\nAll images processed and blog_seed.json updated.");

    } catch (err) {
        console.error("\nError:", err);
    }
}

processImages();
