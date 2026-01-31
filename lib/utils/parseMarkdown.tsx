import React from 'react';

/**
 * 간단한 마크다운 파서 (react-markdown 없이)
 * 지원: **bold**, *italic*, ### 헤딩, \n\n 단락
 */
export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // 단락 분리
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // ### 헤딩
    if (trimmed.startsWith('### ')) {
      return (
        <h4
          key={pIdx}
          className="text-base font-semibold text-zinc-100 mt-4 mb-2 border-l-4 border-cyan-500 pl-3"
        >
          {trimmed.slice(4)}
        </h4>
      );
    }

    // ## 헤딩
    if (trimmed.startsWith('## ')) {
      return (
        <h3
          key={pIdx}
          className="text-lg font-bold text-zinc-50 mt-5 mb-3"
        >
          {trimmed.slice(3)}
        </h3>
      );
    }

    // 일반 단락: **bold**, *italic* 처리
    const parsed = parseInline(trimmed);
    return (
      <p key={pIdx} className="mb-3 leading-relaxed">
        {parsed}
      </p>
    );
  });
}

/**
 * 인라인 마크다운: **bold**, *italic*
 */
function parseInline(text: string): React.ReactNode {
  // **bold** 처리
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    // 이전 텍스트
    if (match.index > lastIndex) {
      parts.push(parseItalic(text.slice(lastIndex, match.index), parts.length));
    }
    // 볼드 텍스트
    parts.push(
      <strong key={`b-${parts.length}`} className="font-bold text-white">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // 남은 텍스트
  if (lastIndex < text.length) {
    parts.push(parseItalic(text.slice(lastIndex), parts.length));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * *italic* 처리
 */
function parseItalic(text: string, keyBase: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const italicRegex = /\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = italicRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <em key={`i-${keyBase}-${parts.length}`} className="italic text-zinc-300">
        {match[1]}
      </em>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * 하이라이트 배열을 불릿 리스트로 렌더링
 */
export function renderHighlights(highlights: string[]): React.ReactNode {
  if (!highlights || highlights.length === 0) return null;

  return (
    <ul className="space-y-2 my-3">
      {highlights.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm">
          <span className="text-cyan-400 mt-0.5">•</span>
          <span className="text-zinc-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}
