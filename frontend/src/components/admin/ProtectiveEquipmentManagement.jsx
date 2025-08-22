"use client";

// React의 useState와 useEffect 훅을 가져옵니다
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

/**
 * 보호 장구 관리 컴포넌트
 * 화학물질 취급 시 필요한 보호 장구들을 관리합니다
 * 실제 데이터베이스의 첨부파일에서 타입 0(보호장구) 항목들을 표시합니다
 */
export default function ProtectiveEquipmentManagement() {
  // 보호 장구 데이터를 상태로 관리
  const [protectiveEquipment, setProtectiveEquipment] = useState([]);
  // 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(false);

  // 컴포넌트가 마운트될 때 보호 장구 데이터를 로드합니다
  useEffect(() => {
    loadProtectiveEquipment();
  }, []); // 빈 배열은 컴포넌트가 처음 렌더링될 때만 실행됨을 의미

  /**
   * 모든 MSDS에서 보호 장구(타입 0) 첨부파일들을 수집하는 함수
   */
  const loadProtectiveEquipment = async () => {
    setLoading(true); // 로딩 시작
    try {
      // 모든 MSDS 데이터를 가져옵니다 (페이지네이션 없이 전체)
      const data = await apiGet("/api/msds?page=1&per_page=1000");
      const msdsList = Array.isArray(data) ? data : data.items || [];
      
      // 모든 MSDS의 상세 정보를 가져와서 보호 장구 수집
      const allProtectiveEquipment = new Map(); // 중복 제거를 위해 Map 사용
      
      for (const msds of msdsList) {
        try {
          // 각 MSDS의 상세 정보 가져오기
          const detailData = await apiGet(`/api/msds/${msds.mid}`);
          
          if (detailData.attachments && Array.isArray(detailData.attachments)) {
            // 타입 0(보호장구) 첨부파일들만 필터링
            const equipment = detailData.attachments.filter(attachment => attachment.type === 0);
            
            equipment.forEach(item => {
              if (!allProtectiveEquipment.has(item.title)) {
                allProtectiveEquipment.set(item.title, {
                  id: item.aid,
                  title: item.title,
                  file_loc: item.file_loc,
                  aid: item.aid,
                  mid: msds.mid, // 어떤 MSDS에 속하는지 기록
                  bodyPart: getBodyPart(item.title), // 제목으로 신체 부위 추정
                  description: getEquipmentDescription(item.title) // 제목으로 설명 생성
                });
              }
            });
          }
        } catch (error) {
          console.error(`Failed to load MSDS ${msds.mid} details:`, error);
        }
      }
      
      // Map을 배열로 변환하여 상태에 저장
      setProtectiveEquipment(Array.from(allProtectiveEquipment.values()));
      
      console.log('보호 장구 데이터 로드 완료:', allProtectiveEquipment.size);
    } catch (error) {
      console.error("Failed to load protective equipment:", error);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  /**
   * 보호 장구 제목으로 신체 부위를 추정하는 함수
   * @param {string} title - 보호 장구 제목
   * @returns {string} 신체 부위
   */
  const getBodyPart = (title) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('안경') || lowerTitle.includes('고글') || lowerTitle.includes('눈')) {
      return "눈";
    } else if (lowerTitle.includes('장갑') || lowerTitle.includes('손')) {
      return "손";
    } else if (lowerTitle.includes('마스크') || lowerTitle.includes('면') || lowerTitle.includes('호흡')) {
      return "호흡기";
    } else if (lowerTitle.includes('복') || lowerTitle.includes('의류') || lowerTitle.includes('전신')) {
      return "전신";
    } else if (lowerTitle.includes('신발') || lowerTitle.includes('부츠') || lowerTitle.includes('발')) {
      return "발";
    } else {
      return "기타";
    }
  };

  /**
   * 보호 장구 제목으로 설명을 생성하는 함수
   * @param {string} title - 보호 장구 제목
   * @returns {string} 설명
   */
  const getEquipmentDescription = (title) => {
    const descriptions = {
      '안경': '화학물질로부터 눈을 보호하는 장구',
      '고글': '화학물질로부터 눈을 보호하는 장구',
      '장갑': '화학물질로부터 손을 보호하는 장구',
      '마스크': '유해 가스나 증기를 차단하는 보호구',
      '방독면': '유해 가스나 증기를 차단하는 보호구',
      '복': '화학물질로부터 전신을 보호하는 장구',
      '신발': '화학물질로부터 발을 보호하는 장구'
    };
    
    for (const [key, desc] of Object.entries(descriptions)) {
      if (title.includes(key)) {
        return desc;
      }
    }
    
    return '화학물질 취급 시 필요한 보호 장구입니다.';
  };

  return (
    <div>
      {/* 섹션 헤더: 제목과 새 보호장구 추가 버튼 */}
      <div className="flex items-center justify-between mb-6">
        {/* 제목: 현재 보호장구 개수 표시 */}
        <h2 className="text-xl font-semibold text-gray-900">
          보호 장구 관리 ({protectiveEquipment.length}개)
        </h2>
        
        {/* 새 보호장구 추가 버튼 */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          {/* 플러스 아이콘 */}
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 보호장구 추가
        </button>
      </div>

      {/* 로딩 상태 표시 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">보호 장구 데이터를 불러오는 중...</span>
        </div>
      ) : (
        /* 보호장구 그리드: 반응형 레이아웃으로 카드들을 배치 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 각 보호장구를 카드 형태로 렌더링 */}
          {protectiveEquipment.map((equipment) => (
            <div key={equipment.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* 이미지 영역 */}
                <div className="flex-shrink-0">
                  {equipment.file_loc && equipment.file_loc !== "None" ? (
                    /* 실제 이미지가 있는 경우 */
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${equipment.mid}/attachment/${equipment.aid}`}
                      alt={equipment.title}
                      className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                      onError={(e) => {
                        // 이미지 로드 실패 시 플레이스홀더로 대체
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* 이미지 플레이스홀더 (실제 이미지가 없거나 로드 실패 시 표시) */}
                  <div 
                    className={`w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center ${
                      equipment.file_loc && equipment.file_loc !== "None" ? 'hidden' : ''
                    }`}
                  >
                    {/* 이미지 아이콘 */}
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* 보호장구 정보 영역 */}
                <div className="flex-1 min-w-0">
                  {/* 보호장구 제목 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{equipment.title}</h3>
                  {/* 신체 부위 */}
                  <p className="text-sm text-gray-500 mb-2">{equipment.bodyPart}</p>
                  {/* 사용 설명 */}
                  <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>
                  
                  {/* 액션 버튼들 */}
                  <div className="flex space-x-2">
                    {/* 수정 버튼 */}
                    <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors" title="수정">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {/* 삭제 버튼 (빨간색 배경) */}
                    <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="삭제">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
