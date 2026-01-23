import Link from 'next/link';

export default function AdminResetPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-900/60 border border-gray-800 rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4">관리자 키 재설정</h1>
        <p className="text-gray-300 mb-6">
          관리자 키를 분실했다면 서버의 환경 변수 <span className="font-semibold">ADMIN_SECRET</span>
          을 새 값으로 설정하고 서비스를 재시작하세요.
        </p>
        <div className="bg-black/40 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 mb-6">
          <p className="mb-2">예시:</p>
          <p className="font-mono">ADMIN_SECRET=새키값</p>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          재시작 후 관리자 대시보드에서 새 키를 입력하면 됩니다.
        </p>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            대시보드로 돌아가기
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
