'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// SwaggerUI는 클라이언트 사이드에서만 로드
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Swagger UI CSS (클라이언트에서만 로드)
if (typeof window !== 'undefined') {
  require('swagger-ui-react/swagger-ui.css');
}

export default function APIDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading API docs:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">API 문서 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">API 문서를 불러올 수 없습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">KPSY LAB API 문서</h1>
          <p className="text-gray-600">
            KPSY LAB 통합 플랫폼의 모든 API 엔드포인트 문서입니다.
          </p>
        </div>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}

