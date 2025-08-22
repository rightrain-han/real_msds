// frontend/src/components/PdfButtons.jsx
"use client";

import { openDownload, openPdfInNewTab } from "@/lib/api";

export default function PdfButtons({ mid }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => openPdfInNewTab(mid)}
        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        title="새 탭으로 열기"
      >
        PDF 열기
      </button>
      <button
        onClick={() => openDownload(mid)}
        className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
        title="파일 다운로드"
      >
        PDF 다운로드
      </button>
    </div>
  );
}
