// frontend/src/app/msds/[mid]/page.jsx
import PdfButtons from "@/components/PdfButtons";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function getDetail(mid) {
  const res = await fetch(`${API_BASE}/api/msds/${encodeURIComponent(mid)}`, { cache: "no-store" });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function MsdsDetailPage({ params }) {
  const { mid } = params;
  const data = await getDetail(mid);

  if (!data) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">MSDS 상세</h1>
        <p className="mt-4 text-red-600">데이터가 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">MSDS 상세 - {data.mid}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-gray-500">제목</div>
          <div className="font-medium">{data.title}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">용도</div>
          <div className="font-medium">{data.usage ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">OS&H</div>
          <div className="font-medium">{String(data.is_osh)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">CHR</div>
          <div className="font-medium">{String(data.is_chr)}</div>
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="text-sm text-gray-500">파일 경로</div>
          <div className="font-mono text-sm">{data.file_loc ?? "-"}</div>
        </div>
      </div>

      <PdfButtons mid={data.mid} />

      {Array.isArray(data.attachments) && data.attachments.length > 0 && (
        <section className="pt-6">
          <h2 className="text-xl font-semibold">부가자료</h2>
          <ul className="list-disc pl-5 mt-2">
            {data.attachments.map((a) => (
              <li key={a.aid}>
                {a.title} ({a.type ?? "file"}) - {a.file_loc ?? "-"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
