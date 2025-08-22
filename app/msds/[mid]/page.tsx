import PdfButtons from "@/components/PdfButtons";

export default function Page({ params }: { params: { mid: string } }) {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">MSDS: {params.mid}</h1>
      <PdfButtons mid={params.mid} />
      {/* 이 아래에 상세 정보 등 다른 UI 배치 */}
    </main>
  );
}
