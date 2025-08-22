"use client";

// React의 useState 훅을 가져옵니다
import { useState } from "react";

/**
 * 검색 헤더 컴포넌트
 * MSDS 검색 기능과 네비게이션을 제공합니다
 * @param {Function} onSearch - 검색 실행 함수
 * @param {Function} onRefresh - 새로고침 함수
 * @param {string} searchQuery - 현재 검색어
 */
export default function SearchHeader({ onSearch, onRefresh, searchQuery }) {
  // 로컬 검색어 상태 (입력 필드의 값을 관리)
  const [localQuery, setLocalQuery] = useState(searchQuery);

  /**
   * 검색 폼 제출을 처리하는 함수
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    onSearch(localQuery); // 검색 실행
  };

  return (
    // 헤더 컨테이너 - 흰색 배경과 하단 테두리, 그림자 효과
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고와 제목 영역 */}
          <div className="flex items-center">
            {/* 로고 아이콘 */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            {/* 시스템 제목과 설명 */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">MSDS 안전관리시스템</h1>
              <p className="text-sm text-gray-600">Material Safety Data Sheet</p>
            </div>
          </div>

          {/* 검색 바 영역 */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSubmit} className="relative">
              {/* 검색 입력 필드 */}
              <input
                type="text"
                placeholder="MSDS명, 용도, 장소, 관련법으로 검색..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {/* 검색 아이콘 (왼쪽) */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* 검색 버튼 (오른쪽) */}
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            {/* 새로고침 버튼 */}
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              새로고침
            </button>
            {/* 관리자 페이지 링크 */}
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              관리자 페이지
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
