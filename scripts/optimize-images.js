/**
 * 이미지 최적화 스크립트
 * PNG/JPG 이미지를 WebP 형식으로 변환하고 압축합니다.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const outputDir = path.join(__dirname, '..', 'public', 'images', 'optimized');

// 출력 디렉토리 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 이미지 최적화 함수
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    // WebP로 변환 및 최적화
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 }) // quality: 80% (고품질), effort: 6 (압축 레벨)
      .toFile(outputPath);

    const optimizedStats = fs.statSync(outputPath);
    const optimizedSize = optimizedStats.size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

    return {
      original: originalSize,
      optimized: optimizedSize,
      reduction: parseFloat(reduction),
      success: true,
    };
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🖼️  이미지 최적화 시작...\n');

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file) && !file.includes('optimized')
  );

  if (imageFiles.length === 0) {
    console.log('⚠️  최적화할 이미지가 없습니다.');
    return;
  }

  console.log(`📁 발견된 이미지: ${imageFiles.length}개\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(outputDir, `${baseName}.webp`);

    console.log(`처리 중: ${file}...`);

    const result = await optimizeImage(inputPath, outputPath);

    if (result.success) {
      totalOriginal += result.original;
      totalOptimized += result.optimized;
      successCount++;

      const originalKB = (result.original / 1024).toFixed(2);
      const optimizedKB = (result.optimized / 1024).toFixed(2);
      console.log(`  ✅ 완료: ${originalKB}KB → ${optimizedKB}KB (${result.reduction}% 감소)`);
    } else {
      console.log(`  ❌ 실패: ${result.error}`);
    }
    console.log('');
  }

  // 요약
  console.log('📊 최적화 요약:');
  console.log(`  ✅ 성공: ${successCount}/${imageFiles.length}개`);
  console.log(`  📦 총 원본 크기: ${(totalOriginal / 1024).toFixed(2)}KB`);
  console.log(`  📦 총 최적화 크기: ${(totalOptimized / 1024).toFixed(2)}KB`);
  console.log(`  💾 절감량: ${((totalOriginal - totalOptimized) / 1024).toFixed(2)}KB (${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(2)}%)`);
  console.log(`\n📁 최적화된 이미지 위치: ${outputDir}`);
  console.log('\n✅ 이미지 최적화가 완료되었습니다!');
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage };

