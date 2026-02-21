import fs from 'fs';
import path from 'path';
import Link from 'next/link';

function loadGameHtml(folder: string) {
  const filePath = path.join(process.cwd(), 'public', 'games', folder, 'index.html');
  let html = fs.readFileSync(filePath, 'utf8');
  const baseTag = `<base href="/games/${folder}/">`;
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>${baseTag}`);
  } else {
    html = `${baseTag}${html}`;
  }
  return html;
}

export default function KybordPage() {
  const html = loadGameHtml('kybord');

  return (
    <div className="min-h-[calc(100vh-72px)] bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
        <span>타자 게임</span>
        <div className="flex items-center gap-3">
          <Link
            href="/games/kybord/index.html"
            className="text-gray-400 hover:text-white transition-colors"
          >
            새 창으로 열기
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            홈으로
          </Link>
        </div>
      </div>
      <iframe
        srcDoc={html}
        title="타자 게임"
        className="w-full h-[calc(100vh-120px)]"
        style={{ border: '0' }}
      />
    </div>
  );
}
