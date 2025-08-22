"use client";

// React 훅들과 필요한 컴포넌트들을 가져옵니다
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import MsdsCard from "@/components/MsdsCard";
import SearchHeader from "@/components/SearchHeader";
import Pagination from "@/components/Pagination";

/**
 * MSDS 안전관리시스템 메인 페이지 컴포넌트
 * MSDS 데이터를 검색하고 페이지네이션으로 표시합니다
 */
export default function HomePage() {
  // MSDS 항목들의 데이터를 저장하는 상태
  const [items, setItems] = useState([]);
  // 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(false);
  // 에러 메시지를 저장하는 상태
  const [error, setError] = useState("");
  // 현재 페이지 번호를 관리하는 상태 (기본값: 1)
  const [currentPage, setCurrentPage] = useState(1);
  // 전체 페이지 수를 관리하는 상태 (기본값: 1)
  const [totalPages, setTotalPages] = useState(1);
  // 전체 MSDS 항목 수를 관리하는 상태 (기본값: 0)
  const [totalItems, setTotalItems] = useState(0);
  // 검색어를 저장하는 상태 (기본값: 빈 문자열)
  const [searchQuery, setSearchQuery] = useState("");
  // 한 페이지당 표시할 MSDS 항목 수 (3x4 그리드)
  const itemsPerPage = 12;

  /**
   * MSDS 데이터를 API에서 가져와서 상태에 저장하는 함수
   * @param {number} page - 가져올 페이지 번호 (기본값: 1)
   * @param {string} query - 검색어 (기본값: 빈 문자열)
   */
  async function loadData(page = 1, query = "") {
    setLoading(true); // 로딩 시작
    setError(""); // 에러 메시지 초기화
    
    try {
      // 검색어가 있으면 검색 API, 없으면 전체 목록 API 호출
      const path = query.trim()
        ? `/api/msds/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${itemsPerPage}`
        : `/api/msds?page=${page}&per_page=${itemsPerPage}`;

      // API에서 데이터 가져오기
      const data = await apiGet(path);
      // 응답 데이터가 배열인지 확인하고, 아니면 items 속성을 사용
      const list = Array.isArray(data) ? data : data.items || [];
      
      // 상태 업데이트
      setItems(list); // MSDS 항목들 저장
      setTotalItems(data.total || list.length); // 전체 항목 수 저장
      setTotalPages(data.total ? Math.ceil(data.total / itemsPerPage) : 1); // 전체 페이지 수 계산
      setCurrentPage(page); // 현재 페이지 번호 저장
    } catch (e) {
      console.error(e);
      // 에러 발생 시 에러 메시지 설정
      setError(e?.message || "데이터를 불러오는데 실패했습니다.");
      setItems([]); // 항목 목록 초기화
    } finally {
      setLoading(false); // 로딩 완료
    }
  }

  // 컴포넌트가 마운트될 때 초기 데이터를 로드합니다
  useEffect(() => {
    loadData(1, searchQuery);
  }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때만 실행됨을 의미

  // MSDS 업데이트/삭제 이벤트를 감지하여 데이터를 다시 로드합니다
  useEffect(() => {
    const handleMsdsUpdate = (event) => {
      console.log('메인 페이지: MSDS 업데이트 이벤트 감지:', event.detail);
      console.log('메인 페이지: 현재 페이지:', currentPage, '검색어:', searchQuery);
      
      // 강제로 데이터를 새로고침 (캐시 무시)
      setTimeout(() => {
        loadData(currentPage, searchQuery);
      }, 100); // 약간의 지연을 두어 백엔드 처리 완료 보장
    };

    const handleMsdsDelete = (event) => {
      console.log('메인 페이지: MSDS 삭제 이벤트 감지:', event.detail);
      console.log('메인 페이지: 현재 페이지:', currentPage, '검색어:', searchQuery);
      
      // 강제로 데이터를 새로고침 (캐시 무시)
      setTimeout(() => {
        loadData(currentPage, searchQuery);
      }, 100); // 약간의 지연을 두어 백엔드 처리 완료 보장
    };

    // 이벤트 리스너 등록
    window.addEventListener('msdsUpdated', handleMsdsUpdate);
    window.addEventListener('msdsDeleted', handleMsdsDelete);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('msdsUpdated', handleMsdsUpdate);
      window.removeEventListener('msdsDeleted', handleMsdsDelete);
    };
  }, [currentPage, searchQuery]); // currentPage와 searchQuery가 변경될 때마다 이벤트 리스너 업데이트

  /**
   * 검색 기능을 처리하는 함수
   * @param {string} query - 검색어
   */
  const handleSearch = (query) => {
    setSearchQuery(query); // 검색어 상태 업데이트
    loadData(1, query); // 첫 번째 페이지부터 검색 결과 로드
  };

  /**
   * 데이터를 새로고침하는 함수
   * 현재 페이지와 검색어를 유지하면서 데이터를 다시 로드합니다
   */
  const handleRefresh = () => {
    loadData(currentPage, searchQuery);
  };

  /**
   * 페이지 변경을 처리하는 함수
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page) => {
    loadData(page, searchQuery); // 새로운 페이지의 데이터 로드
  };

  return (
    // 전체 페이지 컨테이너 - 최소 높이를 화면 전체로 설정하고 회색 배경 적용
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더: 검색 기능과 네비게이션 */}
      <SearchHeader 
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 페이지 정보: 현재 페이지, 전체 페이지, 항목 수 표시 */}
        <div className="mb-6">
          <div className="text-sm text-gray-600">
            페이지 {currentPage}/{totalPages} 총 {totalItems}개 문서 (페이지당 {itemsPerPage}개)
          </div>
        </div>

        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            {/* 회전하는 스피너 */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* MSDS 카드 그리드: 3x4 고정 레이아웃 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {items.length === 0 ? (
              // 데이터가 없을 때 표시되는 메시지
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">데이터가 없습니다.</div>
              </div>
            ) : (
              // MSDS 항목들을 카드 형태로 렌더링
              items.map((item) => (
                <MsdsCard key={item.mid} item={item} />
              ))
            )}
          </div>
        )}

        {/* 페이지네이션: 페이지가 2개 이상일 때만 표시 */}
        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* 푸터 로고와 제목 */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
            <h2 className="text-lg font-semibold text-gray-800">MSDS 안전관리시스템</h2>
          </div>
          {/* 저작권 정보 */}
          <p className="text-sm text-gray-600 mb-1">Copyright © GS EPS Digital Transformation Team</p>
          <p className="text-xs text-gray-500">Material Safety Data Sheet Management System</p>
        </div>
      </footer>
    </div>
  );
}
