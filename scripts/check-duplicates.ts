
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.join(process.cwd(), 'apps', 'portal', 'public', 'images', 'blog');

async function getHash(filePath: string): Promise<string> {
    // Generate a simple signature: 32x32 grayscale raw buffer hex
    const buffer = await sharp(filePath)
        .resize(32, 32, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer();
    return buffer.toString('hex');
}

async function main() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('Images directory not found');
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg')).sort();
    console.log(`Analyzing ${files.length} images...`);

    const hashes = new Map<string, string[]>();

    for (const file of files) {
        try {
            const hash = await getHash(path.join(IMAGES_DIR, file));
            if (!hashes.has(hash)) {
                hashes.set(hash, []);
            }
            hashes.get(hash)?.push(file);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }

    let duplicateCount = 0;
    let duplicateGroups = 0;

    console.log('\n=== Duplicate Report ===');
    for (const [hash, group] of hashes.entries()) {
        if (group.length > 1) {
            duplicateGroups++;
            duplicateCount += (group.length - 1);
            console.log(`Group (Size: ${group.length}): ${group.join(', ')}`);
        }
    }

    if (duplicateGroups === 0) {
        console.log('✅ No duplicates found.');
    } else {
        console.log(`\n❌ Found ${duplicateGroups} groups of duplicates.`);
        console.log(`❌ Total redundant images: ${duplicateCount}`);
    }
}

main().catch(console.error);
