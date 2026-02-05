import { redirect } from 'next/navigation';
import { BLOG_ENABLED } from '@/lib/constants/featureFlags';

export default function BlogPage() {
  if (!BLOG_ENABLED) {
    redirect('/');
  }
  return (
    <div className="page">
      <div className="page-container max-w-4xl mx-auto py-16 text-center text-gray-400">
        블로그 준비 중입니다.
      </div>
    </div>
  );
}
