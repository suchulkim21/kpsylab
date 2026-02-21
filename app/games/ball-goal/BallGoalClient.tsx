'use client';

import { useEffect, useRef, useState } from 'react';

interface BallGoalClientProps {
  styleText: string;
  bodyHtml: string;
  scriptText: string;
}

export default function BallGoalClient({ styleText, bodyHtml, scriptText }: BallGoalClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!containerRef.current || !scriptText) return;
    if (typeof window !== 'undefined' && (window as any).__ballGoalInitialized) return;

    const existing = containerRef.current.querySelector('script[data-ball-goal-script="true"]');
    if (existing) return;

    const script = document.createElement('script');
    script.setAttribute('data-ball-goal-script', 'true');
    script.text = `
      if (!window.__ballGoalInitialized) {
        window.__ballGoalInitialized = true;
        ${scriptText}
      }
    `;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [mounted, scriptText]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {mounted && styleText && <style dangerouslySetInnerHTML={{ __html: styleText }} />}
      {mounted && <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />}
    </div>
  );
}
