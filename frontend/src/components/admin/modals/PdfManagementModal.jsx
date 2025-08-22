"use client";

import { useState } from "react";

/**
 * PDF 관리 모달 컴포넌트
 * 기존 PDF 다운로드, 삭제, 신규 PDF 업로드 기능을 제공합니다
 */
export default function PdfManagementModal({ 
  isOpen, 
  onClose, 
  msdsItem, 
  onPdfUpdated 
}) {
  // 파일 업로드 상태 관리
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  /**
   * 파일 선택 핸들러
   * @param {Event} e - 파일 선택 이벤트
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('PDF 파일만 업로드 가능합니다.');
      e.target.value = '';
    }
  };

  /**
   * 기존 PDF 다운로드 함수
   */
  const handleDownloadPdf = async () => {
    try {
      if (!msdsItem.file_loc) {
        alert('다운로드할 PDF 파일이 없습니다.');
        return;
      }

      // 백엔드 API를 통해 PDF 다운로드
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${msdsItem.mid}/pdf?download=1`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('PDF 다운로드에 실패했습니다.');
      }

      // 파일 다운로드 처리
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${msdsItem.title}_MSDS.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('PDF 다운로드 완료:', msdsItem.title);
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert(`PDF 다운로드에 실패했습니다: ${error.message}`);
    }
  };

  /**
   * 기존 PDF 삭제 함수
   */
  const handleDeletePdf = async () => {
    if (!confirm(`정말로 "${msdsItem.title}"의 PDF 파일을 삭제하시겠습니까?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${msdsItem.mid}/pdf`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('PDF 삭제에 실패했습니다.');
      }

      alert('PDF 파일이 성공적으로 삭제되었습니다.');
      
      // MSDS 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('msdsUpdated', {
        detail: { mid: msdsItem.mid, action: 'pdfDeleted' }
      }));
      
      onPdfUpdated && onPdfUpdated();
      onClose();
    } catch (error) {
      console.error('PDF 삭제 실패:', error);
      alert(`PDF 삭제에 실패했습니다: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  /**
   * 신규 PDF 업로드 함수
   */
  const handleUploadPdf = async () => {
    if (!selectedFile) {
      alert('업로드할 PDF 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf_file', selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'}/api/msds/${msdsItem.mid}/pdf`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('PDF 업로드에 실패했습니다.');
      }

      const result = await response.json();
      alert('PDF 파일이 성공적으로 업로드되었습니다.');
      
      // MSDS 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('msdsUpdated', {
        detail: { mid: msdsItem.mid, action: 'pdfUploaded', filePath: result.file_path }
      }));
      
      onPdfUpdated && onPdfUpdated();
      onClose();
    } catch (error) {
      console.error('PDF 업로드 실패:', error);
      alert(`PDF 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * 모달 닫기 함수
   */
  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    // 모달 오버레이
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            PDF 관리 - {msdsItem?.title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 현재 PDF 상태 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">현재 PDF 상태</h4>
          {msdsItem?.file_loc ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-800">
                  PDF 파일이 등록되어 있습니다
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {msdsItem.file_loc.split('/').pop()}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  PDF 파일이 등록되어 있지 않습니다
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 기존 PDF 관리 버튼들 */}
        {msdsItem?.file_loc && (
          <div className="mb-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">기존 PDF 관리</h4>
            
            {/* 다운로드 버튼 */}
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF 다운로드
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={handleDeletePdf}
              disabled={deleting}
              className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? '삭제 중...' : 'PDF 삭제'}
            </button>
          </div>
        )}

        {/* 신규 PDF 업로드 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {msdsItem?.file_loc ? 'PDF 교체' : 'PDF 업로드'}
          </h4>
          
          {/* 파일 선택 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF 파일 선택
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* 선택된 파일 정보 */}
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-blue-800">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* 업로드 버튼 */}
          <button
            onClick={handleUploadPdf}
            disabled={!selectedFile || uploading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? '업로드 중...' : (msdsItem?.file_loc ? 'PDF 교체' : 'PDF 업로드')}
          </button>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

