"use client";

import { useState, useEffect } from "react";

/**
 * QR 코드 모달 컴포넌트
 * MSDS의 QR 코드를 생성하고 표시하는 모달
 */
export default function QrCodeModal({ isOpen, onClose, msds }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 QR 코드 생성
  useEffect(() => {
    if (isOpen && msds) {
      generateQrCode();
    }
  }, [isOpen, msds]);

  // QR 코드 생성 함수
  const generateQrCode = async () => {
    setIsLoading(true);
    try {
      // MSDS 상세 페이지 URL 생성
      const msdsUrl = `${window.location.origin}/msds/${msds.mid}`;
      
      // QR 코드 API 서비스 사용 (qr-server.com)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(msdsUrl)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("QR 코드 생성 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // QR 코드 다운로드 함수
  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${msds.mid}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("QR 코드 다운로드 오류:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">QR 코드</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {msds && (
          <div className="text-center">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{msds.title}</h3>
              <p className="text-gray-600">ID: {msds.mid}</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="mb-4">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto border rounded-lg shadow-sm"
                  />
                )}
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              QR 코드를 스캔하면 MSDS 상세 페이지로 이동합니다
            </div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={downloadQrCode}
                disabled={isLoading || !qrCodeUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                다운로드
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
