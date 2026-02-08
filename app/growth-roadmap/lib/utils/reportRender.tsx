import React from "react";

/** **bold** 구간을 <strong>으로 렌더링 (질의 1·2·3 분석 리포트 공통) */
export function renderWithBold(text: string, keyPrefix: string): React.ReactNode {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const re = /\*\*(.*?)\*\*/g;
  let match;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`${keyPrefix}-b-${i}`} className="text-white font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}
