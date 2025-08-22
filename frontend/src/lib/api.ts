/**
 * API 관련 유틸리티 함수들
 * MSDS 시스템의 백엔드 API와 통신하는 함수들을 제공합니다
 */

// API 기본 URL 설정 (환경변수에서 가져오고 끝의 슬래시 제거)
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

/**
 * GET 요청을 보내는 범용 함수
 * @param {string} path - API 경로
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiGet(path: string) {
  // URL 구성 (경로가 /로 시작하지 않으면 /를 추가)
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  // fetch 요청 (캐시 비활성화)
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text(); // 일단 텍스트로 받아서 확인
  
  // HTTP 상태 코드가 성공이 아닌 경우 에러 처리
  if (!res.ok) {
    console.error("API ERROR", res.status, text);
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  
  try {
    // 텍스트를 JSON으로 파싱
    const json = JSON.parse(text);
    console.log("[apiGet]", path, json); // ✅ 여기서 실제 응답 구조 확인
    return json;
  } catch {
    // JSON 파싱 실패 시 에러 처리
    console.error("JSON parse fail", text);
    throw new Error("Invalid JSON");
  }
}

/**
 * POST 요청을 보내는 범용 함수
 * @param {string} path - API 경로
 * @param {any} data - 전송할 데이터
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiPost(path: string, data: any) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  
  const text = await res.text();
  
  if (!res.ok) {
    console.error("API ERROR", res.status, text);
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  
  try {
    const json = JSON.parse(text);
    console.log("[apiPost]", path, json);
    return json;
  } catch {
    console.error("JSON parse fail", text);
    throw new Error("Invalid JSON");
  }
}

/**
 * PUT 요청을 보내는 범용 함수
 * @param {string} path - API 경로
 * @param {any} data - 전송할 데이터
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiPut(path: string, data: any) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  
  const text = await res.text();
  
  if (!res.ok) {
    console.error("API ERROR", res.status, text);
    throw new Error(`PUT ${path} failed: ${res.status} ${text}`);
  }
  
  try {
    const json = JSON.parse(text);
    console.log("[apiPut]", path, json);
    return json;
  } catch {
    console.error("JSON parse fail", text);
    throw new Error("Invalid JSON");
  }
}

/**
 * DELETE 요청을 보내는 범용 함수
 * @param {string} path - API 경로
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiDelete(path: string) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(url, {
    method: "DELETE",
    cache: "no-store",
  });
  
  const text = await res.text();
  
  if (!res.ok) {
    console.error("API ERROR", res.status, text);
    throw new Error(`DELETE ${path} failed: ${res.status} ${text}`);
  }
  
  try {
    const json = JSON.parse(text);
    console.log("[apiDelete]", path, json);
    return json;
  } catch {
    console.error("JSON parse fail", text);
    throw new Error("Invalid JSON");
  }
}

/**
 * 파일 업로드를 위한 함수
 * @param {string} path - API 경로
 * @param {FormData} formData - 파일 데이터
 * @returns {Promise<any>} API 응답 데이터
 */
export async function apiUpload(path: string, formData: FormData) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  
  const text = await res.text();
  
  if (!res.ok) {
    console.error("API ERROR", res.status, text);
    throw new Error(`UPLOAD ${path} failed: ${res.status} ${text}`);
  }
  
  try {
    const json = JSON.parse(text);
    console.log("[apiUpload]", path, json);
    return json;
  } catch {
    console.error("JSON parse fail", text);
    throw new Error("Invalid JSON");
  }
}

/**
 * MSDS 목록을 가져오는 함수 (페이지네이션 지원)
 * @param {Object} options - 옵션 객체
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @param {number} options.per_page - 페이지당 항목 수 (기본값: 12)
 * @returns {Promise<any>} MSDS 목록 데이터
 */
export async function fetchMsdsList({ page = 1, per_page = 12 } = {}) {
  const qs = new URLSearchParams({ page: String(page), per_page: String(per_page) });
  return apiGet(`/api/msds?${qs.toString()}`);
}

/**
 * MSDS 검색 함수
 * @param {Object} options - 검색 옵션
 * @param {string} options.q - 검색어 (기본값: 빈 문자열)
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @param {number} options.per_page - 페이지당 항목 수 (기본값: 12)
 * @returns {Promise<any>} 검색 결과 데이터
 */
export async function searchMsds({ q = "", page = 1, per_page = 12 } = {}) {
  const qs = new URLSearchParams({ q, page: String(page), per_page: String(per_page) });
  return apiGet(`/api/msds/search?${qs.toString()}`);
}

/**
 * MSDS 상세 정보를 가져오는 함수
 * @param {string} mid - MSDS ID
 * @returns {Promise<any>} MSDS 상세 정보
 */
export async function fetchMsdsDetail(mid: string) {
  return apiGet(`/api/msds/${encodeURIComponent(mid)}`);
}

/**
 * MSDS 정보를 수정하는 함수
 * @param {string} mid - MSDS ID
 * @param {any} data - 수정할 데이터
 * @returns {Promise<any>} 수정 결과
 */
export async function updateMsds(mid: string, data: any) {
  return apiPut(`/api/msds/${encodeURIComponent(mid)}`, data);
}

/**
 * MSDS를 삭제하는 함수
 * @param {string} mid - MSDS ID
 * @returns {Promise<any>} 삭제 결과
 */
export async function deleteMsds(mid: string) {
  return apiDelete(`/api/msds/${encodeURIComponent(mid)}`);
}

/**
 * MSDS PDF를 업로드하는 함수
 * @param {string} mid - MSDS ID
 * @param {File} file - PDF 파일
 * @returns {Promise<any>} 업로드 결과
 */
export async function uploadMsdsPdf(mid: string, file: File) {
  const formData = new FormData();
  formData.append("pdf_file", file);
  return apiUpload(`/api/msds/${encodeURIComponent(mid)}/pdf`, formData);
}

/**
 * MSDS PDF를 삭제하는 함수
 * @param {string} mid - MSDS ID
 * @returns {Promise<any>} 삭제 결과
 */
export async function deleteMsdsPdf(mid: string) {
  return apiDelete(`/api/msds/${encodeURIComponent(mid)}/pdf`);
}

/**
 * 옵션 데이터를 가져오는 함수
 * @returns {Promise<any>} 옵션 데이터
 */
export async function fetchOptions() {
  return apiGet("/api/msds/options");
}

/**
 * 추가자료 목록을 가져오는 함수
 * @param {Object} options - 필터 옵션
 * @param {string} options.mid - MSDS ID
 * @param {string} options.type - 타입
 * @returns {Promise<any>} 추가자료 목록
 */
export async function fetchAdditionalInfo({ mid, type } = {}) {
  const params = new URLSearchParams();
  if (mid) params.append("mid", mid);
  if (type) params.append("type", type);
  
  const queryString = params.toString();
  return apiGet(`/api/msds/additional-info${queryString ? `?${queryString}` : ""}`);
}

/**
 * 추가자료를 생성하는 함수
 * @param {any} data - 추가자료 데이터
 * @returns {Promise<any>} 생성 결과
 */
export async function createAdditionalInfo(data: any) {
  return apiPost("/api/msds/additional-info", data);
}

/**
 * 추가자료를 수정하는 함수
 * @param {string} aid - 추가자료 ID
 * @param {any} data - 수정할 데이터
 * @returns {Promise<any>} 수정 결과
 */
export async function updateAdditionalInfo(aid: string, data: any) {
  return apiPut(`/api/msds/additional-info/${encodeURIComponent(aid)}`, data);
}

/**
 * 추가자료를 삭제하는 함수
 * @param {string} aid - 추가자료 ID
 * @returns {Promise<any>} 삭제 결과
 */
export async function deleteAdditionalInfo(aid: string) {
  return apiDelete(`/api/msds/additional-info/${encodeURIComponent(aid)}`);
}

/**
 * PDF 파일을 다운로드하는 함수
 * 플라스크가 302/파일 스트림으로 응답하여 브라우저에서 직접 다운로드됩니다
 * @param {string} mid - MSDS ID
 */
export function openDownload(mid: string) {
  // 백엔드에서 ?download=1 이면 강제 다운로드로 처리
  const url = `${API_BASE}/api/msds/${encodeURIComponent(mid)}/download?download=1`;
  window.location.href = url; // 다운로드 트리거
}

/**
 * PDF 파일을 새 탭에서 여는 함수
 * 플라스크가 Supabase signed URL로 리다이렉트하는 경우 바로 열립니다
 * 새 탭이 막히지 않도록 클릭 이벤트 안에서 호출해야 합니다
 * @param {string} mid - MSDS ID
 */
export function openPdfInNewTab(mid: string) {
  const url = `${API_BASE}/api/msds/${encodeURIComponent(mid)}/download`;
  window.open(url, "_blank", "noopener,noreferrer");
}
