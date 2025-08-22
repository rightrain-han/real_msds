"use client";

// React 훅들과 API 함수들을 가져옵니다
import { useState, useEffect } from "react";
import { openDownload, openPdfInNewTab, fetchMsdsDetail } from "@/lib/api";

/**
 * MSDS 카드 컴포넌트
 * 개별 MSDS 항목을 카드 형태로 표시하고 상세 정보를 제공합니다
 * @param {Object} item - MSDS 항목 데이터
 */
export default function MsdsCard({ item }) {
  // MSDS 상세 정보를 저장하는 상태 (경고표지, 보호장구, 사용장소 등)
  const [detailData, setDetailData] = useState(null);
  // 상세 정보 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(false);

  /**
   * MSDS 상세 정보를 API에서 가져오는 함수
   * 컴포넌트가 마운트되거나 item.mid가 변경될 때 실행됩니다
   */
  useEffect(() => {
    const loadDetail = async () => {
      // item.mid가 없으면 함수 종료
      if (!item.mid) return;
      
      setLoading(true); // 로딩 시작
      try {
        // API에서 MSDS 상세 정보 가져오기
        const detail = await fetchMsdsDetail(item.mid);
        setDetailData(detail); // 상세 정보 상태에 저장
      } catch (error) {
        console.error("Failed to load detail:", error);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    loadDetail();
  }, [item.mid]); // item.mid가 변경될 때마다 실행

  /**
   * MSDS 항목의 카테고리(용도)를 반환합니다
   * @returns {string} 카테고리명 (기본값: "기타")
   */
  const getCategory = () => {
    if (item.usage) {
      return item.usage;
    }
    return "기타";
  };

  /**
   * 첨부파일 데이터에서 특정 타입의 항목들을 필터링합니다
   * @param {number} type - 첨부파일 타입 (0: 보호장구, 1: 사용장소, 2: 경고표지)
   * @returns {Array} 해당 타입의 첨부파일 배열
   */
  const getAttachmentsByType = (type) => {
    if (!detailData?.attachments) return [];
    return detailData.attachments.filter(att => att.type === type.toString());
  };

  /**
   * 보호장구 목록을 반환합니다 (type: 0)
   * @returns {Array} 보호장구 제목 배열
   */
  const getProtectiveEquipment = () => {
    const protective = getAttachmentsByType(0);
    return protective.map(item => item.title);
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
   * 사용장소 목록을 반환합니다 (type: 1)
   * @returns {Array} 사용장소 제목 배열
   */
  const getUsageLocations = () => {
    const locations = getAttachmentsByType(1);
    return locations.map(item => item.title);
  };

  /**
   * 경고표지 목록을 반환합니다 (type: 2)
   * @returns {Array} 경고표지 제목 배열
   */
  const getWarningLabels = () => {
    const warnings = getAttachmentsByType(2);
    return warnings.map(item => item.title);
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
   * MSDS 항목의 관련 법규들을 계산하여 반환합니다
   * MSDS 특성에 따라 동적으로 법규를 결정합니다
   * @returns {Array} 관련 법규 배열
   */
  const getLaws = () => {
    const laws = [];
    
    // 기본 법규 - 모든 화학물질에 적용
    laws.push("화학물질관리법");
    
    // OSH 관련 (산업안전보건법)
    if (item.is_osh === "1" || item.is_osh === 1) {
      laws.push("산업안전보건법");
    }
    
    // CHR 관련 (화학물질관리법은 이미 포함되어 있으므로 중복 제거)
    // if (item.is_chr === "1" || item.is_chr === 1) {
    //   laws.push("화학물질관리법");
    // }
    
    // 특수한 경우 추가 법규
    if (item.usage && item.usage.includes("대기")) {
      laws.push("대기환경보전법");
    }
    
    // 폐기물 관련
    if (item.usage && item.usage.includes("폐기물")) {
      laws.push("폐기물관리법");
    }
    
    return laws;
  };

  /**
   * 카드 클릭 이벤트를 처리하는 함수
   * 버튼 클릭 시에는 PDF 열기 동작을 막고, 카드 클릭 시에만 PDF를 새 탭에서 엽니다
   * @param {Event} e - 클릭 이벤트
   */
  const handleCardClick = (e) => {
    // 다운로드 버튼 클릭 시에는 카드 클릭 이벤트를 막음
    if (e.target.closest('button')) {
      return;
    }
    
    // 카드 클릭 시 PDF 새 탭에서 열기
    if (item.file_loc) {
      openPdfInNewTab(item.mid);
    }
  };

  /**
   * 키보드 이벤트를 처리하는 함수 (접근성 지원)
   * Enter 키나 Space 키로도 PDF를 열 수 있도록 합니다
   * @param {Event} e - 키보드 이벤트
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (item.file_loc) {
        openPdfInNewTab(item.mid);
      }
    }
  };

  /**
   * PDF 다운로드 버튼 클릭을 처리하는 함수
   * @param {Event} e - 클릭 이벤트
   */
  const handleDownload = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (item.file_loc) {
      openDownload(item.mid);
    }
  };

  /**
   * PDF 보기 버튼 클릭을 처리하는 함수
   * @param {Event} e - 클릭 이벤트
   */
  const handleViewPdf = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (item.file_loc) {
      openPdfInNewTab(item.mid);
    }
  };

  const category = getCategory();
  const protective = getProtectiveEquipment();
  const locations = getUsageLocations();
  const warnings = getWarningLabels();
  const laws = getLaws();

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyDown={handleKeyDown}
      aria-label={`${item.title} PDF 열기`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {category}
              </span>
            </div>
          </div>
          
          {/* PDF Indicator & Download */}
          <div className="flex items-center space-x-2">
            {item.file_loc && (
              <>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-green-600 font-medium">PDF</span>
                </div>
                <button
                  onClick={handleViewPdf}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="PDF 보기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="PDF 다운로드"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Warning Labels */}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">경고 표지</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {warnings.length > 0 ? (
                    warnings.map((warning, index) => {
                      const warningItem = getAttachmentsByType(2).find(item => item.title === warning);
                      const hasImage = warningItem?.file_loc && warningItem.file_loc !== "None";
                      
                      return (
                        <div key={index} className="flex flex-col items-center group relative">
                          {hasImage && (
                            <div className="relative">
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${item.mid}/attachment/${warningItem.aid}`}
                                alt={warning}
                                className="w-8 h-8 object-contain rounded border border-gray-200 cursor-help"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const textSpan = e.target.parentElement.parentElement.querySelector('.warning-text');
                                  if (textSpan) {
                                    textSpan.style.display = 'inline-flex';
                                  }
                                }}
                                title={getWarningDescription(warning)}
                              />
                              {/* 툴팁 */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                <div className="font-medium mb-1">{warning}</div>
                                <div className="text-gray-300">{getWarningDescription(warning)}</div>
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
                            title={getWarningDescription(warning)}
                          >
                            {warning}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500">정보 없음</span>
                  )}
                </div>
              </div>
            </div>

            {/* Protective Equipment */}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">보호 장구</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {protective.length > 0 ? (
                    protective.map((equipment, index) => {
                      const equipmentItem = getAttachmentsByType(0).find(item => item.title === equipment);
                      const hasImage = equipmentItem?.file_loc && equipmentItem.file_loc !== "None";
                      
                      return (
                        <div key={index} className="flex flex-col items-center group relative">
                          {hasImage && (
                            <div className="relative">
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${item.mid}/attachment/${equipmentItem.aid}`}
                                alt={equipment}
                                className="w-8 h-8 object-contain rounded border border-gray-200 cursor-help"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const textSpan = e.target.parentElement.parentElement.querySelector('.equipment-text');
                                  if (textSpan) {
                                    textSpan.style.display = 'inline-flex';
                                  }
                                }}
                                title={getEquipmentDescription(equipment)}
                              />
                              {/* 툴팁 */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                <div className="font-medium mb-1">{equipment}</div>
                                <div className="text-gray-300">{getEquipmentDescription(equipment)}</div>
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
                            title={getEquipmentDescription(equipment)}
                          >
                            {equipment}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500">정보 없음</span>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Location */}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">사용 장소</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {locations.length > 0 ? (
                    locations.slice(0, 2).map((location, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {location}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">정보 없음</span>
                  )}
                  {locations.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{locations.length - 2}개 더
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Related Laws */}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-700">관련 법규</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {laws.map((law, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                    >
                      {law}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
