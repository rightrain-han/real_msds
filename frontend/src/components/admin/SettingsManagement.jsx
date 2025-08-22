"use client";

// React의 useState 훅을 가져옵니다
import { useState } from "react";

/**
 * 설정 관리 컴포넌트
 * MSDS 시스템에서 사용되는 다양한 옵션들을 관리합니다
 * 용도, 장소, 관련법 등의 설정을 카테고리별로 관리할 수 있습니다
 */
export default function SettingsManagement() {
  // 설정 데이터를 상태로 관리 (실제로는 API에서 가져올 예정)
  const [settings] = useState({
    // 용도 옵션들: 화학물질의 사용 목적을 나타냄
    usage: [
      "순수시약",        // 순수한 시약으로 사용
      "NOx저감",         // 질소산화물 저감용
      "폐수처리",        // 폐수 처리용
      "보일러용수처리"    // 보일러 용수 처리용
    ],
    // 장소 옵션들: 화학물질이 사용되는 장소를 나타냄
    location: [
      "LNG 3호기 CPP",   // LNG 3호기 복합발전소
      "LNG 4호기 CPP",   // LNG 4호기 복합발전소
      "수처리동",        // 수질 처리 건물
      "BIO 2호기 SCR"    // 바이오 2호기 선택적 촉매 환원
    ],
    // 관련법 옵션들: 화학물질과 관련된 법규들을 나타냄
    laws: [
      "화학물질안전법",   // 화학물질의 안전관리에 관한 법률
      "산업안전보건법"    // 산업안전보건에 관한 법률
    ]
  });

  // 전체 설정 항목 개수를 계산
  const totalItems = settings.usage.length + settings.location.length + settings.laws.length;

  return (
    <div>
      {/* 섹션 헤더: 제목과 새 설정 추가 버튼 */}
      <div className="flex items-center justify-between mb-6">
        {/* 제목: 전체 설정 항목 개수 표시 */}
        <h2 className="text-xl font-semibold text-gray-900">
          설정 옵션 관리 ({totalItems}개)
        </h2>
        
        {/* 새 설정 추가 버튼 */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          {/* 플러스 아이콘 */}
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 설정 추가
        </button>
      </div>

      {/* 설정 카테고리들 */}
      <div className="space-y-8">
        {/* 용도 옵션 섹션 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">용도 옵션</h3>
          {/* 용도 옵션들을 그리드 형태로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.usage.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                {/* 옵션 이름 */}
                <span className="text-gray-900">{item}</span>
                {/* 삭제 버튼 */}
                <button className="p-1 text-red-500 hover:text-red-700 transition-colors" title="삭제">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 장소 옵션 섹션 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">장소 옵션</h3>
          {/* 장소 옵션들을 그리드 형태로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.location.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                {/* 옵션 이름 */}
                <span className="text-gray-900">{item}</span>
                {/* 삭제 버튼 */}
                <button className="p-1 text-red-500 hover:text-red-700 transition-colors" title="삭제">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 관련법 옵션 섹션 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">관련법 옵션</h3>
          {/* 관련법 옵션들을 그리드 형태로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.laws.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                {/* 옵션 이름 */}
                <span className="text-gray-900">{item}</span>
                {/* 삭제 버튼 */}
                <button className="p-1 text-red-500 hover:text-red-700 transition-colors" title="삭제">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
