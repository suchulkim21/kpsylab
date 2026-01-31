/**
 * 포스팅 일정 CSV를 읽어서 blog_content_schedule 테이블에 일괄 등록하는 스크립트
 * 
 * 사용법:
 * node scripts/import-posting-schedule.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('필요한 환경 변수:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CSV 파싱 함수
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // 마지막 값
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index] || '';
    });
    return obj;
  });
}

// 메인 함수
async function main() {
  try {
    // CSV 파일 읽기
    const csvPath = path.join(__dirname, '../docs/blog_posting_schedule.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV 파일을 찾을 수 없습니다: ${csvPath}`);
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const schedules = parseCSV(csvContent);
    
    console.log(`📋 총 ${schedules.length}개의 일정을 발견했습니다.`);
    
    // 각 일정을 데이터베이스에 삽입
    let successCount = 0;
    let errorCount = 0;
    
    for (const schedule of schedules) {
      if (!schedule.날짜 || !schedule.제목) {
        console.warn(`⚠️  건너뛰기: 필수 필드가 없습니다.`, schedule);
        continue;
      }
      
      const scheduleData = {
        topic: schedule.제목,
        category: schedule.카테고리 || null,
        status: schedule.상태 || 'draft',
        scheduled_date: schedule.날짜,
        priority: schedule.우선순위?.toLowerCase() || 'medium',
        notes: schedule.비고 || null,
        assigned_to: null,
      };
      
      try {
        const { data, error } = await supabase
          .from('blog_content_schedule')
          .insert([scheduleData])
          .select();
        
        if (error) {
          console.error(`❌ 일정 등록 실패: ${schedule.제목}`, error.message);
          errorCount++;
        } else {
          console.log(`✅ 등록 완료: ${schedule.제목} (${schedule.날짜})`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ 오류 발생: ${schedule.제목}`, err.message);
        errorCount++;
      }
      
      // API 레이트 리밋 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 일정 등록 완료:');
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${errorCount}개`);
    
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

main();
