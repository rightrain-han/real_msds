"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPut } from "@/lib/api";

/**
 * MSDS 편집 모달 컴포넌트
 * MSDS 항목의 정보를 편집할 수 있는 모달
 */
export default function EditMsdsModal({ isOpen, onClose, msds, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    usage: "",
    is_osh: 0,
    is_chr: 0
  });
  const [options, setOptions] = useState({
    usages: [],
    locations: [],
    warnings: [],
    protective: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 옵션 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  // MSDS 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (msds) {
      setFormData({
        title: msds.title || "",
        usage: msds.usage || "",
        is_osh: msds.is_osh || 0,
        is_chr: msds.is_chr || 0
      });
    }
  }, [msds]);

  // 옵션 데이터 로드 함수
  const loadOptions = async () => {
    setIsLoading(true);
    try {
      const response = await apiGet("/api/msds/options");
      setOptions(response);
    } catch (error) {
      console.error("옵션 데이터 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msds?.mid) return;

    setIsSaving(true);
    try {
      const response = await apiPut(`/api/msds/${msds.mid}`, formData);
      
      // MSDS 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('msdsUpdated', {
        detail: { mid: msds.mid, action: 'msdsUpdated', data: response.data }
      }));
      
      onSave && onSave(response.data);
      onClose();
    } catch (error) {
      console.error("MSDS 수정 오류:", error);
      alert("MSDS 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">MSDS 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* MSDS ID (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MSDS ID
              </label>
              <input
                type="text"
                value={msds?.mid || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 용도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                용도
              </label>
              <select
                name="usage"
                value={formData.usage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {options.usages.map((usage, index) => (
                  <option key={index} value={usage}>
                    {usage}
                  </option>
                ))}
              </select>
            </div>

            {/* 법적 적용 여부 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                법적 적용 여부
              </label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_osh"
                  name="is_osh"
                  checked={formData.is_osh === 1}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_osh" className="ml-2 text-sm text-gray-700">
                  산업안전보건법 적용
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_chr"
                  name="is_chr"
                  checked={formData.is_chr === 1}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_chr" className="ml-2 text-sm text-gray-700">
                  화학물질관리법 적용
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
