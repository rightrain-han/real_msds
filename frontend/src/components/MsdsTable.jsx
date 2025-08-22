"use client";

import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import PdfButtons from "./PdfButtons"; // PdfButtons.tsx가 default export라면 이렇게

export default function MsdsTable() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(opts = {}) {
    const kw = (opts.keyword ?? "").trim();
    const path = kw
      ? `/api/msds/search?q=${encodeURIComponent(kw)}&page=1&per_page=50`
      : `/api/msds?page=1&per_page=50`;

    setLoading(true);
    setErr("");
    try {
      const data = await apiGet(path);
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(list);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "요청 실패");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // 최초 로드
  useEffect(() => {
    load({ keyword: "" });
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    load({ keyword });
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">MSDS 목록</h1>

      <form onSubmit={onSubmit} className="flex gap-2 mb-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="키워드(예: 암모니아, 염산...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </form>

      {loading && <div className="text-sm text-gray-500">불러오는 중...</div>}
      {err && <div className="text-sm text-red-600">에러: {err}</div>}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">MID</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">용도</th>
              <th className="px-3 py-2 text-left">OS&H</th>
              <th className="px-3 py-2 text-left">CHR</th>
              <th className="px-3 py-2 text-left">PDF</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.mid} className="border-t">
                  <td className="px-3 py-2">{it.mid}</td>
                  <td className="px-3 py-2">{it.title}</td>
                  <td className="px-3 py-2">{it.usage || "-"}</td>
                  <td className="px-3 py-2">{Number(it.is_osh) ? "✅" : "—"}</td>
                  <td className="px-3 py-2">{Number(it.is_chr) ? "✅" : "—"}</td>
                  <td className="px-3 py-2">
                    <PdfButtons mid={it.mid} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
