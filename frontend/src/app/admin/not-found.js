import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          관리자 페이지를 찾을 수 없습니다
        </h2>
        
        <p className="text-gray-600 mb-6">
          요청하신 관리자 페이지가 존재하지 않거나 접근 권한이 없습니다.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/admin"
            className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            관리자 메인 페이지
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>관리자 권한이 필요하시면 시스템 관리자에게 문의하세요.</p>
        </div>
      </div>
    </div>
  );
}
