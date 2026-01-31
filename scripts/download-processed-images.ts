
import fs from 'fs';
import * as nodePath from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: nodePath.join(process.cwd(), 'apps', 'portal', '.env.local') });

// Configuration
const KEYWORDS_FILE = nodePath.join(process.cwd(), 'apps', 'portal', 'docs', 'blog_image_keywords_100.md');
const IMAGES_DIR = nodePath.join(process.cwd(), 'apps', 'portal', 'public', 'images', 'blog');
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630; // 1.91:1 ratio
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY is not defined in environment variables.');
    process.exit(1);
}

interface BlogPost {
    index: number;
    title: string;
    keywords: string;
}

// Parse markdown table to get keywords
function parseKeywords(): BlogPost[] {
    const content = fs.readFileSync(KEYWORDS_FILE, 'utf-8');
    const lines = content.split('\n');
    const posts: BlogPost[] = [];

    for (const line of lines) {
        const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
        if (match) {
            posts.push({
                index: parseInt(match[1], 10),
                title: match[2].trim(),
                keywords: match[3].trim(),
            });
        }
    }
    return posts;
}

interface PexelsPhoto {
    id: number;
    src: {
        large2x: string;
        large: string;
        original: string;
    };
    photographer: string;
}

// Global Set to track used Photo IDs across the entire run
const usedPhotoIds = new Set<number>();

async function fetchUniquePexelsImage(query: string): Promise<PexelsPhoto | null> {
    try {
        // Try up to 5 pages to find a unique image
        for (let page = 1; page <= 5; page++) {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=landscape`;
            const response = await fetch(url, {
                headers: {
                    Authorization: PEXELS_API_KEY!
                }
            });

            if (!response.ok) {
                console.error(`Pexels API Error (Page ${page}): ${response.status} ${response.statusText}`);
                continue; // Try next page or fail
            }

            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                for (const photo of data.photos) {
                    if (!usedPhotoIds.has(photo.id)) {
                        usedPhotoIds.add(photo.id);
                        return photo as PexelsPhoto;
                    }
                }
            } else {
                // No more photos found for this query
                break;
            }

            // If we are here, all photos on this page were duplicates.
            // Loop will continue to next page.
        }

        console.warn(`⚠️ Could not find any unique image for '${query}' after 5 pages.`);
        return null;

    } catch (error) {
        console.error('Error fetching from Pexels:', error);
        return null;
    }
}

async function downloadImage(url: string, outputPath: string, title: string, photographer: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const buffer = await response.arrayBuffer();

        await sharp(Buffer.from(buffer))
            .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'center' })
            .withMetadata({
                exif: {
                    IFD0: {
                        ImageDescription: title,
                        Copyright: `Photo by ${photographer} on Pexels`
                    }
                }
            })
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error(`❌ Error processing ${nodePath.basename(outputPath)}:`, error);
        return false;
    }
}

async function main() {
    const posts = parseKeywords();
    console.log(`Found ${posts.length} posts to process.`);
    console.log(`Using Pexels API with UNIQUE Check (per_page=15).`);

    let successCount = 0;
    let failCount = 0;

    for (const [i, post] of posts.entries()) {
        const filename = `topic_${String(post.index).padStart(3, '0')}.jpg`;
        const outputPath = nodePath.join(IMAGES_DIR, filename);

        process.stdout.write(`[${i + 1}/${posts.length}] Searching '${post.keywords}' for ${filename}... `);

        // 1. Get Unique Pexels Image
        const photo = await fetchUniquePexelsImage(post.keywords);

        if (!photo) {
            console.log(`❌ No image found`);
            failCount++;
            continue;
        }

        // Prefer highest res available
        const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;

        // 2. Download and Process
        const success = await downloadImage(imageUrl, outputPath, post.title, photo.photographer);

        if (success) {
            console.log(`✅ Done (ID: ${photo.id})`);
            successCount++;
        } else {
            console.log(`❌ Failed`);
            failCount++;
        }

        // Small delay
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n🎉 Process Complete`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Unique Photos Used: ${usedPhotoIds.size}`);
}

main().catch(console.error);
