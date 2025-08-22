// PdfButtons.tsx
"use client";

type Props = { mid: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

export default function PdfButtons({ mid }: Props) {
  const viewUrl = `${API_BASE}/api/msds/${mid}/download`;

  return (
    <div className="flex gap-2">
      {/* 보기: 새 탭으로 그냥 이동 */}
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1 rounded bg-blue-600 text-white"
      >
        보기
      </a>

      {/* 다운로드: location.href 로 이동 (download 속성은 리다이렉트에선 잘 안 먹힐 수 있어요) */}
      <button
        className="px-3 py-1 rounded bg-emerald-600 text-white"
        onClick={() => {
          window.location.href = viewUrl;
        }}
      >
        다운로드
      </button>
    </div>
  );
}
