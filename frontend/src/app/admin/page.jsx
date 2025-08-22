"use client";

// React와 필요한 컴포넌트들을 가져옵니다
import { useState } from "react";
import MsdsManagement from "@/components/admin/MsdsManagement";
import WarningLabelsManagement from "@/components/admin/WarningLabelsManagement";
import ProtectiveEquipmentManagement from "@/components/admin/ProtectiveEquipmentManagement";
import SettingsManagement from "@/components/admin/SettingsManagement";

/**
 * MSDS 관리자 페이지 메인 컴포넌트
 * 탭 기반 네비게이션으로 4개의 관리 섹션을 제공합니다
 */
export default function AdminPage() {
  // 현재 활성화된 탭을 관리하는 상태 (기본값: MSDS 관리)
  const [activeTab, setActiveTab] = useState("msds");

  // 관리자 페이지에서 사용할 탭들의 정보를 정의
  const tabs = [
    { id: "msds", label: "MSDS 관리" },        // MSDS 항목들을 관리
    { id: "warning", label: "경고 표지" },      // 경고 표지들을 관리
    { id: "equipment", label: "보호 장구" },    // 보호 장구들을 관리
    { id: "settings", label: "설정 관리" }      // 시스템 설정들을 관리
  ];

  /**
   * 현재 선택된 탭에 따라 해당하는 컴포넌트를 렌더링합니다
   * @returns {JSX.Element} 선택된 탭에 해당하는 관리 컴포넌트
   */
  const renderContent = () => {
    switch (activeTab) {
      case "msds":
        return <MsdsManagement />;              // MSDS 관리 컴포넌트
      case "warning":
        return <WarningLabelsManagement />;     // 경고 표지 관리 컴포넌트
      case "equipment":
        return <ProtectiveEquipmentManagement />; // 보호 장구 관리 컴포넌트
      case "settings":
        return <SettingsManagement />;          // 설정 관리 컴포넌트
      default:
        return <MsdsManagement />;              // 기본값으로 MSDS 관리 표시
    }
  };

  return (
    // 전체 페이지 컨테이너 - 최소 높이를 화면 전체로 설정하고 회색 배경 적용
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 헤더 상단: 제목과 네비게이션 버튼들 */}
          <div className="flex items-center justify-between">
            {/* 페이지 제목 */}
            <h1 className="text-2xl font-bold text-gray-900">MSDS 관리자</h1>
            
            {/* 우측 네비게이션 버튼들 */}
            <div className="flex items-center space-x-4">
              {/* 메인 페이지로 돌아가기 버튼 */}
              <a href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <span>메인으로</span>
                {/* 오른쪽 화살표 아이콘 */}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              {/* 로그아웃 버튼 */}
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                {/* 로그아웃 아이콘 */}
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 영역 */}
          <div className="mt-4">
            <nav className="flex space-x-8">
              {/* 각 탭 버튼들을 동적으로 생성 */}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} // 탭 클릭 시 활성 탭 변경
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600" // 활성 탭 스타일 (파란색)
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" // 비활성 탭 스타일
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 현재 선택된 탭에 해당하는 컴포넌트를 렌더링 */}
        {renderContent()}
      </main>
    </div>
  );
}
