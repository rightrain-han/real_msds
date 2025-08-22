/**
 * 페이지네이션 컴포넌트
 * MSDS 목록의 페이지 이동을 위한 네비게이션을 제공합니다
 * @param {number} currentPage - 현재 페이지 번호
 * @param {number} totalPages - 전체 페이지 수
 * @param {number} totalItems - 전체 항목 수
 * @param {Function} onPageChange - 페이지 변경 시 호출되는 함수
 */
export default function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  /**
   * 표시할 페이지 번호들을 계산하는 함수
   * 페이지가 많을 때는 일부만 표시하고 '...'로 생략합니다
   * @returns {Array} 표시할 페이지 번호 배열 (숫자 또는 '...')
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 한 번에 표시할 최대 페이지 수
    
    // 전체 페이지가 5개 이하면 모든 페이지 표시
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지가 앞쪽에 있는 경우 (1~3페이지)
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 4) {
          pages.push('...'); // 생략 표시
          pages.push(totalPages); // 마지막 페이지
        }
      } 
      // 현재 페이지가 뒤쪽에 있는 경우 (마지막 3페이지)
      else if (currentPage >= totalPages - 2) {
        pages.push(1); // 첫 번째 페이지
        pages.push('...'); // 생략 표시
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } 
      // 현재 페이지가 중간에 있는 경우
      else {
        pages.push(1); // 첫 번째 페이지
        pages.push('...'); // 생략 표시
        // 현재 페이지 전후 1페이지씩 표시
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...'); // 생략 표시
        pages.push(totalPages); // 마지막 페이지
      }
    }
    
    return pages;
  };

  return (
    // 페이지네이션 컨테이너 - 중앙 정렬로 깔끔한 레이아웃
    <div className="flex flex-col items-center space-y-4">
      {/* 페이지 정보 표시 - 더 큰 폰트와 강조 */}
      <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
        <span className="text-sm text-gray-600">
          페이지 <span className="font-semibold text-blue-600">{currentPage}</span> / <span className="font-semibold text-blue-600">{totalPages}</span> • 총 <span className="font-semibold text-blue-600">{totalItems}</span>개 항목
        </span>
      </div>
      
      {/* 페이지네이션 버튼들 */}
      <div className="flex items-center space-x-2">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1} // 첫 페이지에서는 비활성화
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          &lt; 이전
        </button>
        
        {/* 페이지 번호 버튼들 */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)} // 숫자인 경우에만 클릭 가능
            disabled={page === '...'} // 생략 표시는 클릭 불가
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white border border-blue-600 shadow-md' // 현재 페이지 스타일
                : page === '...'
                ? 'text-gray-400 cursor-default' // 생략 표시 스타일
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400' // 일반 페이지 스타일
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages} // 마지막 페이지에서는 비활성화
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음 &gt;
        </button>
        
        {/* 마지막 페이지 버튼 (페이지가 2개 이상일 때만 표시) */}
        {totalPages > 1 && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages} // 마지막 페이지에서는 비활성화
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            마지막
          </button>
        )}
      </div>
    </div>
  );
}
