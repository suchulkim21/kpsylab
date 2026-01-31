/**
 * 블로그 콘텐츠 생성 유틸리티
 * AI 기반 블로그 포스트 생성 및 품질 검증
 */

export interface BlogPostData {
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string;
  image?: string;
}

export interface ContentGenerationConfig {
  topic: string;
  category?: string;
  targetLength?: number; // 최소 3000자
  style?: 'professional' | 'casual';
  includeExamples?: boolean;
  author?: string;
}

export interface QualityCheck {
  wordCount: number;
  htmlValid: boolean;
  hasRequiredTags: boolean;
  minLengthMet: boolean;
  issues: string[];
}

/**
 * HTML 태그 제거
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * 텍스트 길이 계산 (HTML 제거 후)
 */
export function getTextLength(html: string): number {
  return stripHtml(html).length;
}

/**
 * HTML 유효성 검사
 */
export function validateHtml(html: string): boolean {
  // 기본적인 HTML 태그 검증
  const allowedTags = ['h3', 'p', 'ul', 'ol', 'li', 'strong', 'blockquote', 'em', 'br'];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const tags = html.match(tagRegex) || [];
  
  for (const tag of tags) {
    const tagName = tag.match(/<\/?([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase();
    if (tagName && !allowedTags.includes(tagName)) {
      return false;
    }
  }
  
  // h1, h2 사용 금지 확인
  if (/<h[12][^>]*>/i.test(html)) {
    return false;
  }
  
  return true;
}

/**
 * 필수 태그 확인 (h3, p 최소 1개씩)
 */
export function hasRequiredTags(html: string): boolean {
  const hasH3 = /<h3[^>]*>/i.test(html);
  const hasP = /<p[^>]*>/i.test(html);
  return hasH3 && hasP;
}

/**
 * 콘텐츠 품질 검증
 */
export function validateContentQuality(post: BlogPostData): QualityCheck {
  const issues: string[] = [];
  const wordCount = getTextLength(post.content);
  const minLength = 3000;
  
  // 길이 검증
  if (wordCount < minLength) {
    issues.push(`콘텐츠 길이가 너무 짧습니다 (${wordCount}자 / 최소 ${minLength}자)`);
  }
  
  // HTML 유효성 검증
  const htmlValid = validateHtml(post.content);
  if (!htmlValid) {
    issues.push('HTML 형식이 올바르지 않습니다 (허용되지 않은 태그 사용 또는 h1/h2 사용)');
  }
  
  // 필수 태그 확인
  const hasRequired = hasRequiredTags(post.content);
  if (!hasRequired) {
    issues.push('필수 태그(h3, p)가 누락되었습니다');
  }
  
  // 제목 검증
  if (!post.title || post.title.trim().length === 0) {
    issues.push('제목이 없습니다');
  }
  
  // 태그 검증
  if (!post.tags || post.tags.trim().length === 0) {
    issues.push('태그가 없습니다');
  }
  
  return {
    wordCount,
    htmlValid,
    hasRequiredTags: hasRequired,
    minLengthMet: wordCount >= minLength,
    issues,
  };
}

/**
 * AI 프롬프트 생성
 */
export function generatePrompt(config: ContentGenerationConfig): string {
  const {
    topic,
    category = '',
    targetLength = 3000,
    style = 'professional',
    includeExamples = true,
  } = config;

  const styleGuide = style === 'professional'
    ? '전문적이고 단정한 문체를 사용하세요. 불필요한 이모지나 과장된 표현을 피하세요.'
    : '친근하고 접근하기 쉬운 문체를 사용하세요.';

  return `다음 주제에 대한 블로그 포스트를 작성해주세요.

주제: ${topic}
${category ? `카테고리: ${category}` : ''}
목표 길이: 최소 ${targetLength}자

작성 규칙:
1. HTML 형식으로 작성 (마크다운 사용 금지)
2. 제목은 <h3> 태그만 사용 (h1, h2 사용 금지)
3. 본문은 <p> 태그 사용
4. 리스트는 <ul><li> 또는 <ol><li> 사용
5. 강조는 <strong> 태그 사용
6. ${styleGuide}
7. 심리학/행동과학 맥락 유지
8. 주장형 문장 과다 사용 금지 (근거 기반 서술)
9. 과도한 의학적/진단적 단정 금지
${includeExamples ? '10. 실제 사례나 예시 포함' : ''}

구조:
1. 요약형 소제목 (<h3>)
2. 핵심 정의/맥락 (<p> 2~3개)
3. 심화 설명/사례 (<p> 2~4개)
4. 정리/시사점 (<p> 1~2개)
5. 필요시 리스트/인용

JSON 형식으로 응답:
{
  "title": "포스트 제목",
  "content": "<h3>...</h3><p>...</p>...",
  "tags": "태그1,태그2,태그3",
  "summary": "한 줄 요약"
}`;
}

/**
 * 콘텐츠 유사도 검사 (간단한 버전)
 * 실제로는 더 정교한 알고리즘이 필요하지만, 기본적인 검증만 수행
 */
export function checkSimilarity(content: string, existingContents: string[]): number {
  // 간단한 단어 기반 유사도 계산
  const words = stripHtml(content)
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  if (words.length === 0) return 0;
  
  let maxSimilarity = 0;
  
  for (const existing of existingContents) {
    const existingWords = stripHtml(existing)
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    const commonWords = words.filter(w => existingWords.includes(w));
    const similarity = (commonWords.length / words.length) * 100;
    
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }
  
  return maxSimilarity;
}

/**
 * 콘텐츠 정규화 (일관성 유지)
 */
export function normalizeContent(content: string): string {
  // 불필요한 공백 제거
  let normalized = content
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  
  // 빈 태그 제거
  normalized = normalized.replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '');
  
  return normalized;
}
