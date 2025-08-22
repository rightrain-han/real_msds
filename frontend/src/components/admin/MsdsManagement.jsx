"use client";

// React 훅들과 API 함수를 가져옵니다
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import Pagination from "@/components/Pagination";

// 모달 컴포넌트들을 import
import QrCodeModal from "./modals/QrCodeModal";
import EditMsdsModal from "./modals/EditMsdsModal";
import PdfManagementModal from "./modals/PdfManagementModal";

/**
 * MSDS 항목 관리 컴포넌트
 * MSDS 데이터를 리스트 형태로 표시하고 관리 기능을 제공합니다
 * 페이지네이션을 지원하여 147개 항목을 여러 페이지로 나누어 표시합니다
 */
export default function MsdsManagement() {
  // MSDS 항목들의 데이터를 저장하는 상태
  const [items, setItems] = useState([]);
  // 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(false);
  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // 페이지당 표시할 항목 수
  const itemsPerPage = 20;
  
  // 모달 상태 관리
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 컴포넌트가 마운트될 때 MSDS 데이터를 로드합니다
  useEffect(() => {
    loadMsdsItems(1);
  }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때만 실행됨을 의미

  /**
   * MSDS 항목들을 API에서 가져와서 상태에 저장합니다
   * @param {number} page - 로드할 페이지 번호
   */
  const loadMsdsItems = async (page = 1) => {
    setLoading(true); // 로딩 시작
    try {
      // API에서 MSDS 데이터를 가져옵니다 (상세 정보 포함, 페이지네이션 지원)
      const data = await apiGet(`/api/msds?page=${page}&per_page=${itemsPerPage}&detailed=true`);
      
      // 응답 데이터가 배열인지 확인하고, 아니면 items 속성을 사용합니다
      const list = Array.isArray(data) ? data : data.items || [];
      
      // 상태 업데이트
      setItems(list); // 상세 정보가 포함된 MSDS 항목들 저장
      setTotalItems(data.total || list.length); // 전체 항목 수 저장
      setTotalPages(data.total ? Math.ceil(data.total / itemsPerPage) : 1); // 전체 페이지 수 계산
      setCurrentPage(page); // 현재 페이지 번호 저장
      
      console.log('관리자 페이지 MSDS 로드 (상세 정보 포함):', {
        page: data.page,
        per_page: data.per_page,
        total: data.total,
        itemsCount: list.length,
        sampleItem: list[0] ? {
          mid: list[0].mid,
          title: list[0].title,
          attachmentsCount: list[0].attachments?.length || 0,
          warnings: list[0].attachments?.filter(a => a.type === 2).length || 0,
          protective: list[0].attachments?.filter(a => a.type === 0).length || 0,
          locations: list[0].attachments?.filter(a => a.type === 1).length || 0
        } : null
      });
    } catch (error) {
      console.error("Failed to load MSDS items:", error);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  /**
   * 페이지 변경을 처리하는 함수
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page) => {
    loadMsdsItems(page);
  };

  /**
   * MSDS 항목 클릭 시 상세 정보를 로드하는 함수 (이미 상세 정보가 로드되어 있으므로 로깅만 수행)
   * @param {string} mid - MSDS ID
   */
  const handleItemClick = async (mid) => {
    try {
      // 이미 상세 정보가 로드되어 있으므로 해당 항목의 정보만 로깅
      const currentItem = items.find(item => item.mid === mid);
      if (currentItem) {
        console.log('MSDS 항목 클릭:', mid, currentItem);
        console.log('첨부파일 개수:', currentItem.attachments?.length || 0);
        console.log('경고표지:', getAttachmentsByType(currentItem, 2).length, '개');
        console.log('보호장구:', getAttachmentsByType(currentItem, 0).length, '개');
        console.log('사용장소:', getAttachmentsByType(currentItem, 1).length, '개');
      }
    } catch (error) {
      console.error('Failed to get MSDS info:', error);
    }
  };

  /**
   * QR코드 모달을 여는 함수
   * @param {Object} item - MSDS 항목 데이터
   * @param {Event} e - 이벤트 객체
   */
  const handleQrCodeClick = (item, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setSelectedItem(item);
    setShowQrModal(true);
  };

  /**
   * 수정 모달을 여는 함수
   * @param {Object} item - MSDS 항목 데이터
   * @param {Event} e - 이벤트 객체
   */
  const handleEditClick = (item, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setSelectedItem(item);
    setShowEditModal(true);
  };

  /**
   * MSDS 수정 저장 함수
   * @param {Object} updatedItem - 수정된 MSDS 데이터
   */
  const handleSaveEdit = async (updatedItem) => {
    try {
      // 수정 전 원본 데이터 백업
      const originalItem = items.find(item => item.mid === updatedItem.mid);
      if (!originalItem) {
        throw new Error('원본 데이터를 찾을 수 없습니다.');
      }

      console.log('수정 전 원본 데이터:', originalItem);
      console.log('수정할 데이터:', updatedItem);

      // 백엔드 API 호출하여 MSDS 수정
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${updatedItem.mid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedItem.title,
          usage: updatedItem.usage,
          file_loc: updatedItem.file_loc,
          is_osh: updatedItem.is_osh,
          is_chr: updatedItem.is_chr
        })
      });

      if (!response.ok) {
        throw new Error('MSDS 수정에 실패했습니다.');
      }

      // 백엔드 응답에서 최신 데이터 추출
      const responseData = await response.json();
      const latestData = responseData.data;

      if (latestData) {
        // 백엔드에서 반환된 최신 데이터로 상태 업데이트
        setItems(prevItems => 
          prevItems.map(item => 
            item.mid === updatedItem.mid ? latestData : item
          )
        );
        console.log('MSDS 수정 완료 (최신 데이터로 업데이트):', latestData);
      } else {
        // 백엔드에서 데이터를 반환하지 않은 경우 기존 방식으로 업데이트
        setItems(prevItems => 
          prevItems.map(item => 
            item.mid === updatedItem.mid ? { ...item, ...updatedItem } : item
          )
        );
        console.log('MSDS 수정 완료 (기존 방식):', updatedItem);
      }

      // 수정 후 데이터 검증
      const updatedData = latestData || { ...originalItem, ...updatedItem };
      console.log('수정 후 최종 데이터:', updatedData);

      // 메인 페이지 데이터 동기화를 위해 브라우저 이벤트 발생
      window.dispatchEvent(new CustomEvent('msdsUpdated', { 
        detail: { 
          mid: updatedItem.mid, 
          data: updatedData,
          originalData: originalItem,
          updatedData: updatedItem
        } 
      }));

      alert(`${updatedItem.title} 항목이 성공적으로 수정되었습니다.`);
      setShowEditModal(false);
    } catch (error) {
      console.error('MSDS 수정 실패:', error);
      alert(`MSDS 수정에 실패했습니다: ${error.message}`);
    }
  };

  /**
   * PDF 관리 모달 열기 함수
   * @param {Object} item - MSDS 항목 데이터
   * @param {Event} e - 이벤트 객체
   */
  const handlePdfManagement = (item, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setSelectedItem(item);
    setShowPdfModal(true);
  };

  /**
   * PDF 업데이트 후 콜백 함수
   */
  const handlePdfUpdated = () => {
    // 현재 페이지 데이터 다시 로드
    loadMsdsItems(currentPage);
    // 메인 페이지 동기화
    window.dispatchEvent(new CustomEvent('msdsUpdated', { 
      detail: { mid: selectedItem?.mid } 
    }));
  };

  /**
   * MSDS 항목 삭제 함수
   * @param {Object} item - MSDS 항목 데이터
   * @param {Event} e - 이벤트 객체
   */
  const handleDeleteClick = async (item, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (confirm(`정말로 "${item.title}" 항목을 삭제하시겠습니까?`)) {
      try {
        // 백엔드 API 호출하여 MSDS 삭제
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${item.mid}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('MSDS 삭제에 실패했습니다.');
        }

        // 성공 시 현재 항목 목록에서 제거
        setItems(prevItems => prevItems.filter(msdsItem => msdsItem.mid !== item.mid));
        
        // 메인 페이지 데이터 동기화를 위해 브라우저 이벤트 발생
        window.dispatchEvent(new CustomEvent('msdsDeleted', { 
          detail: { mid: item.mid } 
        }));
        
        alert(`${item.title} 항목이 성공적으로 삭제되었습니다.`);
        console.log('MSDS 삭제 완료:', item.mid);
      } catch (error) {
        console.error('MSDS 삭제 실패:', error);
        alert(`MSDS 삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  /**
   * MSDS 항목의 카테고리(용도)를 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @returns {string} 카테고리명 (기본값: "기타")
   */
  const getCategory = (item) => {
    return item.usage || "기타";
  };

  /**
   * MSDS 항목의 첨부파일들을 타입별로 분류하여 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @param {number} type - 첨부파일 타입 (0: 보호장구, 1: 사용장소, 2: 경고표지)
   * @returns {Array} 해당 타입의 첨부파일 목록
   */
  const getAttachmentsByType = (item, type) => {
    if (!item.attachments || !Array.isArray(item.attachments)) {
      return [];
    }
    return item.attachments.filter(attachment => attachment.type === type);
  };

  /**
   * MSDS 항목의 경고 표지 개수를 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @returns {number} 경고 표지 개수 (기본값: 0)
   */
  const getWarningCount = (item) => {
    // 첨부파일에서 타입 2(경고표지) 개수 계산
    return getAttachmentsByType(item, 2).length;
  };

  /**
   * 경고표지의 의미를 반환합니다
   * @param {string} warningTitle - 경고표지 제목
   * @returns {string} 경고표지의 의미 설명
   */
  const getWarningDescription = (warningTitle) => {
    const warningDescriptions = {
      "경고": "일반적인 주의사항",
      "고압가스": "압축된 가스로 압력에 의해 폭발할 수 있음",
      "급성독성": "단기간 노출 시 심각한 건강상 해를 줄 수 있음",
      "금속부식성, 피부부식성, 심한 눈 손상성": "금속, 피부, 눈에 심각한 부식을 일으킬 수 있음",
      "산화성": "다른 물질과 반응하여 산화를 촉진할 수 있음",
      "수생환경유해성": "수생 생물과 환경에 유해한 영향을 줄 수 있음",
      "인화성, 물반응성, 자기반응성, 자연발화성, 가지발열성, 유기과산화물": "화재 위험이 높고 물과 반응하거나 자연발화할 수 있음",
      "폭발성, 자기반응성, 유기과산화물": "폭발 위험이 높고 불안정한 물질",
      "호흡기과민성, 발암성, 생식세포변이원성, 생식독성, 특정표적장기독성": "호흡기 알레르기, 암 유발, 유전자 변이, 생식 기능 저하 등을 일으킬 수 있음"
    };
    
    return warningDescriptions[warningTitle] || warningTitle;
  };

  /**
   * MSDS 항목의 보호 장구 개수를 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @returns {number} 보호 장구 개수 (기본값: 0)
   */
  const getProtectiveCount = (item) => {
    // 첨부파일에서 타입 0(보호장구) 개수 계산
    return getAttachmentsByType(item, 0).length;
  };

  /**
   * 보호장구의 의미를 반환합니다
   * @param {string} equipmentTitle - 보호장구 제목
   * @returns {string} 보호장구의 의미 설명
   */
  const getEquipmentDescription = (equipmentTitle) => {
    const equipmentDescriptions = {
      "방독마스크": "유해가스나 증기를 차단하는 호흡보호구",
      "방진마스크": "먼지나 분진을 차단하는 호흡보호구",
      "보안경": "눈을 보호하는 안전보호구",
      "보호복": "전신을 보호하는 보호복",
      "송기마스크": "외부에서 깨끗한 공기를 공급하는 호흡보호구",
      "안전장갑": "손을 보호하는 보호구",
      "용접용보안면": "용접 작업 시 얼굴을 보호하는 보호구"
    };
    
    return equipmentDescriptions[equipmentTitle] || equipmentTitle;
  };

  /**
   * MSDS 항목의 사용 장소 정보를 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @returns {string} 사용 장소들을 쉼표로 구분한 문자열
   */
  const getLocation = (item) => {
    // 첨부파일에서 타입 1(사용장소) 제목들을 추출
    const locations = getAttachmentsByType(item, 1).map(attachment => attachment.title);
    return locations.length > 0 ? locations.join(", ") : "정보 없음";
  };

  /**
   * MSDS 항목의 관련 법규들을 계산하여 반환합니다
   * @param {Object} item - MSDS 항목 데이터
   * @returns {string} 관련 법규들을 쉼표로 구분한 문자열
   */
  const getRelatedLaws = (item) => {
    const laws = [];
    
    // OSH 관련인 경우 산업안전보건법 추가
    if (item.is_osh === "1" || item.is_osh === 1) {
      laws.push("산업안전보건법");
    }
    
    // 사용처에 "대기"가 포함된 경우 대기환경보전법 추가
    if (item.usage && item.usage.includes("대기")) {
      laws.push("대기환경보전법");
    }
    
    // 사용처에 "폐기물"이 포함된 경우 폐기물관리법 추가
    if (item.usage && item.usage.includes("폐기물")) {
      laws.push("폐기물관리법");
    }
    
    // 화학물질관리법은 모든 화학물질에 기본적으로 적용되므로 맨 앞에 추가
    laws.unshift("화학물질관리법");
    
    // 법규들을 쉼표로 구분하여 문자열로 반환
    return laws.join(", ");
  };

  return (
    <div>
      {/* 섹션 헤더: 제목과 새 항목 추가 버튼 */}
      <div className="flex items-center justify-between mb-6">
        {/* 제목: 현재 MSDS 항목 개수 표시 */}
        <h2 className="text-xl font-semibold text-gray-900">
          MSDS 항목 관리 ({totalItems}개) - DB 완전 매핑
        </h2>
        
        {/* 새 항목 추가 버튼 */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          {/* 플러스 아이콘 */}
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 항목 추가
        </button>
      </div>

      {/* 페이지 정보 표시 */}
      <div className="mb-4 text-sm text-gray-600">
        페이지 {currentPage}/{totalPages} • 총 {totalItems}개 항목 (페이지당 {itemsPerPage}개)
      </div>

      {/* MSDS 항목 리스트 */}
      {loading ? (
        // 로딩 중일 때 표시되는 스피너
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      ) : (
        // MSDS 항목들을 세로로 나열
        <div className="space-y-4">
          {items.map((item) => (
            // 각 MSDS 항목을 카드 형태로 표시 (클릭 가능)
            <div 
              key={item.mid} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleItemClick(item.mid)}
            >
              <div className="flex items-start justify-between">
                {/* 왼쪽: MSDS 정보 영역 */}
                <div className="flex-1">
                  {/* 항목 제목과 카테고리 태그 */}
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {/* 카테고리 태그 (파란색 배경) */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategory(item)}
                    </span>
                  </div>

                  {/* PDF 파일 링크 (파일이 있는 경우만 표시) */}
                  {item.file_loc && (
                    <div className="text-sm text-blue-600 mb-2">
                      PDF: {item.file_loc.split('/').pop() || '파일명 없음'}
                    </div>
                  )}

                  {/* 경고표지와 보호장구 실제 이미지 표시 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* 경고표지 영역 */}
                    <div>
                      <span className="text-xs font-medium text-gray-700">경고 표지</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(() => {
                          const warnings = getAttachmentsByType(item, 2);
                          return warnings.length > 0 ? (
                            warnings.map((warning, index) => {
                              const hasImage = warning.file_loc && warning.file_loc !== "None";
                              
                              return (
                                <div key={index} className="flex flex-col items-center group relative">
                                  {hasImage && (
                                    <div className="relative">
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${item.mid}/attachment/${warning.aid}`}
                                        alt={warning.title}
                                        className="w-8 h-8 object-contain rounded border border-gray-200 cursor-help"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          const textSpan = e.target.parentElement.parentElement.querySelector('.warning-text');
                                          if (textSpan) {
                                            textSpan.style.display = 'inline-flex';
                                          }
                                        }}
                                        title={getWarningDescription(warning.title)}
                                      />
                                      {/* 툴팁 */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        <div className="font-medium mb-1">{warning.title}</div>
                                        <div className="text-gray-300">{getWarningDescription(warning.title)}</div>
                                        {/* 툴팁 화살표 */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>
                                  )}
                                  <span
                                    className={`warning-text inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help ${
                                      hasImage ? 'mt-1' : ''
                                    }`}
                                    style={{
                                      display: hasImage ? 'none' : 'inline-flex'
                                    }}
                                    title={getWarningDescription(warning.title)}
                                  >
                                    {warning.title}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-500">정보 없음</span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 보호장구 영역 */}
                    <div>
                      <span className="text-xs font-medium text-gray-700">보호 장구</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(() => {
                          const protective = getAttachmentsByType(item, 0);
                          return protective.length > 0 ? (
                            protective.map((equipment, index) => {
                              const hasImage = equipment.file_loc && equipment.file_loc !== "None";
                              
                              return (
                                <div key={index} className="flex flex-col items-center group relative">
                                  {hasImage && (
                                    <div className="relative">
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${item.mid}/attachment/${equipment.aid}`}
                                        alt={equipment.title}
                                        className="w-8 h-8 object-contain rounded border border-gray-200 cursor-help"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          const textSpan = e.target.parentElement.parentElement.querySelector('.equipment-text');
                                          if (textSpan) {
                                            textSpan.style.display = 'inline-flex';
                                          }
                                        }}
                                        title={getEquipmentDescription(equipment.title)}
                                      />
                                      {/* 툴팁 */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        <div className="font-medium mb-1">{equipment.title}</div>
                                        <div className="text-gray-300">{getEquipmentDescription(equipment.title)}</div>
                                        {/* 툴팁 화살표 */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>
                                  )}
                                  <span
                                    className={`equipment-text inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 cursor-help ${
                                      hasImage ? 'mt-1' : ''
                                    }`}
                                    style={{
                                      display: hasImage ? 'none' : 'inline-flex'
                                    }}
                                    title={getEquipmentDescription(equipment.title)}
                                  >
                                    {equipment.title}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-500">정보 없음</span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* 장소 정보 */}
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">장소:</span> {getLocation(item)}
                  </div>

                  {/* 관련 법규 정보 */}
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">관련법:</span> {getRelatedLaws(item)}
                  </div>
                </div>

                {/* 오른쪽: 액션 버튼들 */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* QR코드 생성 버튼 */}
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors" 
                    title="QR코드"
                    onClick={(e) => handleQrCodeClick(item, e)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                  
                  {/* PDF 관리 버튼 */}
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors" 
                    title="PDF 관리"
                    onClick={(e) => handlePdfManagement(item, e)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  
                  {/* 수정 버튼 */}
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors" 
                    title="수정"
                    onClick={(e) => handleEditClick(item, e)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  {/* 삭제 버튼 (빨간색 배경) */}
                  <button 
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" 
                    title="삭제"
                    onClick={(e) => handleDeleteClick(item, e)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션: 페이지가 2개 이상일 때만 표시 */}
      {!loading && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* QR코드 모달 */}
      {showQrModal && selectedItem && (
        <QrCodeModal
          item={selectedItem}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* 수정 모달 */}
      {showEditModal && selectedItem && (
        <EditMsdsModal
          item={selectedItem}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* PDF 관리 모달 */}
      {showPdfModal && selectedItem && (
        <PdfManagementModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          msdsItem={selectedItem}
          onPdfUpdated={handlePdfUpdated}
        />
      )}
    </div>
  );
}
