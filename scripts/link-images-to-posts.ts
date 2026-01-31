
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'apps', 'portal', 'docs', 'blog_posts_phase1');
const IMAGES_DIR = path.join(process.cwd(), 'apps', 'portal', 'public', 'images', 'blog');

async function main() {
    if (!fs.existsSync(DOCS_DIR)) {
        console.error('❌ Docs directory not found:', DOCS_DIR);
        return;
    }

    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md')).sort();
    console.log(`Found ${files.length} markdown files to update.`);

    let updatedCount = 0;

    for (const file of files) {
        const filePath = path.join(DOCS_DIR, file);
        const fileIndex = parseInt(file.replace('.md', ''), 10);
        const imageName = `topic_${String(fileIndex).padStart(3, '0')}.jpg`;
        const imagePathRelative = `/images/blog/${imageName}`;
        const imageFullPath = path.join(IMAGES_DIR, imageName);

        // Check if image exists
        if (!fs.existsSync(imageFullPath)) {
            console.warn(`⚠️ Warning: Image not found for ${file} -> ${imageName}`);
            continue;
        }

        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if "## 이미지 경로" already exists
        if (content.includes('## 이미지 경로')) {
            // Update existing
            content = content.replace(
                /## 이미지 경로\s*\n.*/,
                `## 이미지 경로\n${imagePathRelative}`
            );
        } else {
            // Insert before "## 내용" or at the end of metadata section
            // Ideally after "## 태그"
            if (content.includes('## 태그')) {
                content = content.replace(
                    /(## 태그\s*\n.*)/,
                    `$1\n\n## 이미지 경로\n${imagePathRelative}`
                );
            } else {
                // Fallback: Just append to top metadata if tag not found (unlikely based on template)
                // Or insert before ## 내용
                content = content.replace(
                    /(## 내용)/,
                    `## 이미지 경로\n${imagePathRelative}\n\n$1`
                );
            }
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        updatedCount++;
        // console.log(`✅ Updated ${file}`);
    }

    console.log(`\n🎉 Completed! Updated ${updatedCount}/${files.length} files.`);
}

main().catch(console.error);
