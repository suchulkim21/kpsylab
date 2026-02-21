import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import BallGoalClient from './BallGoalClient';

function loadBallGoalHtml() {
  const filePath = path.join(process.cwd(), 'public', 'games', 'ball-goal', 'index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);

  const body = bodyMatch ? bodyMatch[1] : '';
  const bodyWithoutScript = body.replace(/<script[\s\S]*?<\/script>/gi, '');

  return {
    style: styleMatch ? styleMatch[1] : '',
    body: bodyWithoutScript,
    script: scriptMatch ? scriptMatch[1] : '',
  };
}

export default function BallGoalPage() {
  const { style, body, script } = loadBallGoalHtml();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
        <span>볼 골</span>
        <div className="flex items-center gap-3">
          <Link
            href="/games/ball-goal/index.html"
            className="text-gray-400 hover:text-white transition-colors"
          >
            새 창으로 열기
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            홈으로
          </Link>
        </div>
      </div>
      <BallGoalClient styleText={style} bodyHtml={body} scriptText={script} />
    </div>
  );
}
