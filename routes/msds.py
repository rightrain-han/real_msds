"""
MSDS API 라우트 모듈
Material Safety Data Sheet 관련 API 엔드포인트들을 정의합니다.
"""

from flask import Blueprint, request, jsonify, abort, current_app, redirect
from sqlalchemy import text
from supabase import create_client
from extensions import db

# MSDS 블루프린트 생성 - app.py에서 /api/msds로 프리픽스 등록됨
msds_bp = Blueprint("msds", __name__)

# 데이터베이스 헬퍼 함수들: SELECT/INSERT/UPDATE/DELETE 공용 실행기

def fetch_all(sql, params=None):
    """
    여러 행을 조회하는 헬퍼 함수
    
    Args:
        sql (str): 실행할 SQL 쿼리
        params (dict, optional): SQL 파라미터
        
    Returns:
        list: 조회된 행들의 딕셔너리 리스트
    """
    with db.engine.connect() as con:
        res = con.execute(text(sql), params or {})
        rows = [dict(r._mapping) for r in res]
    return rows

def fetch_one(sql, params=None):
    """
    단일 행을 조회하는 헬퍼 함수
    
    Args:
        sql (str): 실행할 SQL 쿼리
        params (dict, optional): SQL 파라미터
        
    Returns:
        dict or None: 조회된 행의 딕셔너리 또는 None
    """
    with db.engine.connect() as con:
        res = con.execute(text(sql), params or {})
        row = res.mappings().first()
        return dict(row) if row else None

def exec_write(sql, params=None):
    """
    데이터를 쓰는 헬퍼 함수 (INSERT, UPDATE, DELETE)
    
    Args:
        sql (str): 실행할 SQL 쿼리
        params (dict, optional): SQL 파라미터
    """
    with db.engine.begin() as con:  # 트랜잭션 자동 관리
        con.execute(text(sql), params or {})

# 0) 전체 목록 (페이지네이션 지원)  GET /api/msds
@msds_bp.get("")
def list_msds():
    """
    MSDS 전체 목록을 조회하는 엔드포인트 (페이지네이션 지원)
    
    Query Parameters:
        page (int, optional): 페이지 번호 (기본값: 1)
        per_page (int, optional): 페이지당 항목 수 (기본값: 12)
        detailed (bool, optional): 상세 정보 포함 여부 (기본값: false)
        
    Returns:
        JSON: MSDS 목록과 페이지네이션 정보
    """
    # 쿼리 파라미터 처리
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 12)), 1), 100)
    detailed = request.args.get("detailed", "false").lower() == "true"
    
    # 전체 개수 조회
    total_result = fetch_one("SELECT COUNT(*) as cnt FROM msds")
    total = total_result['cnt'] if total_result else 0
    
    if detailed:
        # 상세 정보 포함하여 조회 (첨부파일 포함)
        offset = (page - 1) * per_page
        rows = fetch_all(f"""
            SELECT m.*, 
                   GROUP_CONCAT(DISTINCT CONCAT(ai.aid, ':', ai.title, ':', ai.type, ':', COALESCE(ai.file_loc, '')) ORDER BY ai.aid SEPARATOR '|') as attachments_str
            FROM msds m
            LEFT JOIN msds_additional_relation mar ON m.mid = mar.mid
            LEFT JOIN msds_additional_info ai ON mar.aid = ai.aid
            GROUP BY m.mid
            ORDER BY m.mid ASC 
            LIMIT {per_page} OFFSET {offset}
        """)
        
        # 첨부파일 문자열을 파싱하여 객체 배열로 변환
        for row in rows:
            attachments = []
            if row.get('attachments_str'):
                attachment_parts = row['attachments_str'].split('|')
                for part in attachment_parts:
                    if part:
                        aid, title, type_val, file_loc = part.split(':', 3)
                        attachments.append({
                            'aid': aid,
                            'title': title,
                            'type': int(type_val),
                            'file_loc': file_loc if file_loc else None
                        })
            row['attachments'] = attachments
            # 임시 필드 제거
            if 'attachments_str' in row:
                del row['attachments_str']
    else:
        # 기본 정보만 조회
        offset = (page - 1) * per_page
        rows = fetch_all(f"SELECT * FROM msds ORDER BY mid ASC LIMIT {per_page} OFFSET {offset}")
    
    return jsonify({
        "items": rows,
        "page": page,
        "per_page": per_page,
        "total": total
    })

# 1) 상세   GET /api/msds/<mid>
@msds_bp.get("/<mid>")
def get_msds(mid):
    """
    특정 MSDS의 상세 정보를 조회하는 엔드포인트
    
    Args:
        mid (str): MSDS ID
        
    Returns:
        JSON: MSDS 상세 정보와 첨부파일 목록
    """
    # MSDS 기본 정보 조회
    row = fetch_one("SELECT * FROM msds WHERE mid=:mid", {"mid": mid})
    if not row:
        return jsonify({"message": "MSDS not found"}), 404

    # 추가자료(첨부파일) 함께 반환
    # 스키마상 관계 테이블(msds_additional_relation)과 조인해야 하며, 컬럼명은 createdAt/camelCase입니다.
    attachments = fetch_all(
        """
        SELECT i.aid, i.title, i.type, i.file_loc, r.createdAt
        FROM msds_additional_relation AS r
        JOIN msds_additional_info AS i ON i.aid = r.aid
        WHERE r.mid = :mid
        ORDER BY r.createdAt DESC
        """,
        {"mid": mid}
    )
    row["attachments"] = attachments
    return jsonify(row)

# 2) 생성   POST /api/msds
@msds_bp.post("")
def create_msds():
    """
    새로운 MSDS를 생성하는 엔드포인트
    
    Returns:
        JSON: 생성 결과 메시지
    """
    data = request.get_json(force=True)

    # 필수 필드 검증 (최소한의 검증)
    required = ["mid", "title"]
    for f in required:
        if f not in data or data[f] in ("", None):
            return jsonify({"message": f"'{f}' is required"}), 400

    # MSDS 데이터베이스에 삽입
    exec_write(
        """
        INSERT INTO msds (mid, title, usage, file_loc, is_osh, is_chr)
        VALUES (:mid, :title, :usage, :file_loc, :is_osh, :is_chr)
        """,
        {
            "mid": data["mid"],
            "title": data["title"],
            "usage": data.get("usage"),
            "file_loc": data.get("file_loc"),
            "is_osh": int(data.get("is_osh", 0)),
            "is_chr": int(data.get("is_chr", 0)),
        }
    )
    return jsonify({"message": "MSDS created successfully"}), 201

# 3) 수정   PUT /api/msds/<mid>
@msds_bp.put("/<mid>")
def update_msds(mid):
    """
    기존 MSDS를 수정하는 엔드포인트
    
    Args:
        mid (str): 수정할 MSDS ID
        
    Returns:
        JSON: 수정 결과 메시지
    """
    data = request.get_json(force=True)
    
    # MSDS 존재 여부 확인
    exist = fetch_one("SELECT mid FROM msds WHERE mid=:mid", {"mid": mid})
    if not exist:
        return jsonify({"message": "MSDS not found"}), 404

    # MSDS 데이터 업데이트
    exec_write(
        """
        UPDATE msds
        SET title=:title, `usage`=:usage, file_loc=:file_loc, is_osh=:is_osh, is_chr=:is_chr
        WHERE mid=:mid
        """,
        {
            "mid": mid,
            "title": data.get("title"),
            "usage": data.get("usage"),
            "file_loc": data.get("file_loc"),
            "is_osh": int(data.get("is_osh", 0)),
            "is_chr": int(data.get("is_chr", 0)),
        }
    )
    
    # 수정된 MSDS 데이터 조회하여 반환
    updated_msds = fetch_one(
        """
        SELECT m.*, 
               GROUP_CONCAT(DISTINCT CONCAT(ai.aid, ':', ai.title, ':', ai.type, ':', COALESCE(ai.file_loc, '')) ORDER BY ai.aid SEPARATOR '|') as attachments_str
        FROM msds m
        LEFT JOIN msds_additional_relation mar ON m.mid = mar.mid
        LEFT JOIN msds_additional_info ai ON mar.aid = ai.aid
        WHERE m.mid = :mid
        GROUP BY m.mid
        """,
        {"mid": mid}
    )
    
    if updated_msds:
        # 첨부파일 문자열을 파싱하여 객체 배열로 변환
        attachments = []
        if updated_msds.get('attachments_str'):
            attachment_parts = updated_msds['attachments_str'].split('|')
            for part in attachment_parts:
                if part:
                    aid, title, type_val, file_loc = part.split(':', 3)
                    attachments.append({
                        'aid': aid,
                        'title': title,
                        'type': int(type_val),
                        'file_loc': file_loc if file_loc else None
                    })
        
        # 응답 데이터 구성
        response_data = {
            "mid": updated_msds['mid'],
            "title": updated_msds['title'],
            "usage": updated_msds['usage'],
            "file_loc": updated_msds['file_loc'],
            "is_osh": updated_msds['is_osh'],
            "is_chr": updated_msds['is_chr'],
            "attachments": attachments
        }
        
        return jsonify({
            "message": "MSDS updated successfully",
            "data": response_data
        })
    
    return jsonify({"message": "MSDS updated successfully"})

# 4) 삭제   DELETE /api/msds/<mid>
@msds_bp.delete("/<mid>")
def delete_msds(mid):
    """
    MSDS를 삭제하는 엔드포인트
    
    Args:
        mid (str): 삭제할 MSDS ID
        
    Returns:
        JSON: 삭제 결과 메시지
    """
    exec_write("DELETE FROM msds WHERE mid=:mid", {"mid": mid})
    return jsonify({"message": "MSDS deleted successfully"})

# 5) PDF 관리 API들
# 5-1) PDF 업로드   POST /api/msds/<mid>/pdf
@msds_bp.post("/<mid>/pdf")
def upload_pdf(mid):
    """
    MSDS PDF 파일을 업로드하는 엔드포인트
    
    Args:
        mid (str): MSDS ID
        
    Returns:
        JSON: 업로드 결과 메시지
    """
    # MSDS 존재 여부 확인
    exist = fetch_one("SELECT mid FROM msds WHERE mid=:mid", {"mid": mid})
    if not exist:
        return jsonify({"message": "MSDS not found"}), 404

    # 파일 업로드 확인
    if 'pdf_file' not in request.files:
        return jsonify({"message": "No PDF file provided"}), 400
    
    file = request.files['pdf_file']
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"message": "Only PDF files are allowed"}), 400

    try:
        # Supabase 설정값 가져오기
        bucket = current_app.config.get("SUPABASE_BUCKET", "msds")
        
        # Supabase 클라이언트 생성
        sb = _get_supabase()
        
        # 파일명 생성 (타임스탬프 + 원본 파일명)
        import time
        timestamp = int(time.time() * 1000)
        filename = f"{timestamp}_{file.filename}"
        file_path = f"pdfs/{filename}"
        
        # Supabase Storage에 파일 업로드
        result = sb.storage.from_(bucket).upload(file_path, file.read())
        
        # Supabase upload 메서드 응답 처리
        if hasattr(result, 'error') and result.error:
            return jsonify({"message": f"Upload failed: {result.error}"}), 500
        
        # 데이터베이스에 파일 경로 업데이트
        exec_write(
            "UPDATE msds SET file_loc=:file_loc WHERE mid=:mid",
            {"file_loc": file_path, "mid": mid}
        )
        
        return jsonify({
            "message": "PDF uploaded successfully",
            "file_path": file_path
        })
        
    except Exception as e:
        return jsonify({"message": f"Upload failed: {str(e)}"}), 500

# 5-2) PDF 삭제   DELETE /api/msds/<mid>/pdf
@msds_bp.delete("/<mid>/pdf")
def delete_pdf(mid):
    """
    MSDS PDF 파일을 삭제하는 엔드포인트
    
    Args:
        mid (str): MSDS ID
        
    Returns:
        JSON: 삭제 결과 메시지
    """
    # MSDS 존재 여부 확인
    msds_data = fetch_one("SELECT file_loc FROM msds WHERE mid=:mid", {"mid": mid})
    if not msds_data:
        return jsonify({"message": "MSDS not found"}), 404
    
    if not msds_data.get('file_loc'):
        return jsonify({"message": "No PDF file to delete"}), 404

    try:
        # Supabase 설정값 가져오기
        bucket = current_app.config.get("SUPABASE_BUCKET", "msds")
        
        # Supabase 클라이언트 생성
        sb = _get_supabase()
        
        # Supabase Storage에서 파일 삭제 시도 (실패해도 DB 업데이트는 진행)
        try:
            result = sb.storage.from_(bucket).remove([msds_data['file_loc']])
            # Supabase remove 메서드는 리스트를 반환하므로 에러 체크 방식 수정
            if not (isinstance(result, list) and len(result) > 0):
                # Storage에서 삭제 실패했지만 DB에서는 제거하도록 진행
                pass
        except Exception as storage_error:
            # Storage 에러가 발생해도 DB에서는 제거하도록 진행
            pass
        
        # 데이터베이스에서 파일 경로 제거
        exec_write(
            "UPDATE msds SET file_loc=NULL WHERE mid=:mid",
            {"mid": mid}
        )
        
        return jsonify({"message": "PDF deleted successfully"})
        
    except Exception as e:
        return jsonify({"message": f"Delete failed: {str(e)}"}), 500

# 5) 추가자료 목록   GET /api/msds/additional-info
@msds_bp.get("/additional-info")
def get_all_additional():
    """
    추가자료 목록을 조회하는 엔드포인트
    쿼리 파라미터로 필터링 가능
    
    Query Parameters:
        mid (str, optional): MSDS ID로 필터링
        type (str, optional): 타입으로 필터링
        
    Returns:
        JSON: 추가자료 목록
    """
    # 쿼리 파라미터에서 필터 조건 추출
    mid = request.args.get("mid")
    typ = request.args.get("type")

    # 동적 WHERE 조건 구성
    conds = []
    params = {}
    if mid:
        conds.append("mid=:mid")
        params["mid"] = mid
    if typ:
        conds.append("type=:type")
        params["type"] = typ

    # WHERE 절 구성 (조건이 있으면 WHERE 추가, 없으면 빈 문자열)
    where = " WHERE " + " AND ".join(conds) if conds else ""
    rows = fetch_all(f"SELECT * FROM msds_additional_info{where} ORDER BY createdAt DESC", params)
    return jsonify(rows)

# 6) 추가자료 생성  POST /api/msds/additional-info
@msds_bp.post("/additional-info")
def create_additional():
    """
    새로운 추가자료를 생성하는 엔드포인트
    
    Returns:
        JSON: 생성 결과 메시지
    """
    data = request.get_json(force=True)
    
    # 필수 필드 검증
    required = ["aid", "mid", "title"]
    for f in required:
        if f not in data or data[f] in ("", None):
            return jsonify({"message": f"'{f}' is required"}), 400

    # 추가자료 데이터베이스에 삽입
    exec_write(
        """
        INSERT INTO msds_additional_info (aid, mid, title, type, file_loc)
        VALUES (:aid, :mid, :title, :type, :file_loc)
        """,
        {
            "aid": data["aid"],
            "mid": data["mid"],
            "title": data["title"],
            "type": data.get("type"),
            "file_loc": data.get("file_loc"),
        }
    )
    return jsonify({"message": "MSDS additional info created successfully"}), 201

# 7) 추가자료 수정  PUT /api/msds/additional-info/<aid>
@msds_bp.put("/additional-info/<aid>")
def update_additional(aid):
    """
    기존 추가자료를 수정하는 엔드포인트
    
    Args:
        aid (str): 수정할 추가자료 ID
        
    Returns:
        JSON: 수정 결과 메시지
    """
    data = request.get_json(force=True)
    
    # 추가자료 데이터 업데이트
    exec_write(
        """
        UPDATE msds_additional_info
        SET title=:title, type=:type, file_loc=:file_loc
        WHERE aid=:aid
        """,
        {
            "aid": aid,
            "title": data.get("title"),
            "type": data.get("type"),
            "file_loc": data.get("file_loc"),
        }
    )
    return jsonify({"message": "MSDS additional info updated successfully"})

# 8) 옵션 데이터 조회   GET /api/msds/options
@msds_bp.get("/options")
def get_options():
    """
    MSDS 수정에 필요한 옵션 데이터를 조회하는 엔드포인트
    
    Returns:
        JSON: 용도, 장소, 경고표지, 보호장구 옵션 목록
    """
    # 고유한 용도 추출
    usages = fetch_all("SELECT DISTINCT `usage` FROM msds WHERE `usage` IS NOT NULL AND `usage` != '' ORDER BY `usage`")
    usage_list = [row['usage'] for row in usages]
    
    # 고유한 장소 추출 (타입 1)
    locations = fetch_all("""
        SELECT DISTINCT i.title 
        FROM msds_additional_info AS i
        JOIN msds_additional_relation AS r ON i.aid = r.aid
        WHERE i.type = 1
        ORDER BY i.title
    """)
    location_list = [row['title'] for row in locations]
    
    # 고유한 경고표지 추출 (타입 2)
    warnings = fetch_all("""
        SELECT DISTINCT i.title 
        FROM msds_additional_info AS i
        JOIN msds_additional_relation AS r ON i.aid = r.aid
        WHERE i.type = 2
        ORDER BY i.title
    """)
    warning_list = [row['title'] for row in warnings]
    
    # 고유한 보호장구 추출 (타입 0)
    protective = fetch_all("""
        SELECT DISTINCT i.title 
        FROM msds_additional_info AS i
        JOIN msds_additional_relation AS r ON i.aid = r.aid
        WHERE i.type = 0
        ORDER BY i.title
    """)
    protective_list = [row['title'] for row in protective]
    
    return jsonify({
        "usages": usage_list,
        "locations": location_list,
        "warnings": warning_list,
        "protective": protective_list
    })

# 9) 추가자료 삭제  DELETE /api/msds/additional-info/<aid>
@msds_bp.delete("/additional-info/<aid>")
def delete_additional(aid):
    """
    추가자료를 삭제하는 엔드포인트
    
    Args:
        aid (str): 삭제할 추가자료 ID
        
    Returns:
        JSON: 삭제 결과 메시지
    """
    exec_write("DELETE FROM msds_additional_info WHERE aid=:aid", {"aid": aid})
    return jsonify({"message": "MSDS additional info deleted successfully"})


# --- 기존 목록/상세/CRUD 엔드포인트들이 여기에 있다고 가정 ---

def _get_supabase():
    """
    Supabase 클라이언트를 생성하는 헬퍼 함수
    
    Returns:
        SupabaseClient: Supabase 클라이언트 인스턴스
    """
    url = current_app.config["SUPABASE_URL"]
    key = current_app.config["SUPABASE_SERVICE_ROLE_KEY"]  # 서버 전용 키 권장
    return create_client(url, key)

# 2) 검색 + 페이지네이션: GET /api/msds/search?q=...&page=&per_page=
@msds_bp.get("/search")
def search_msds():
    """
    MSDS 검색 및 페이지네이션 엔드포인트
    
    Query Parameters:
        q (str, optional): 검색어
        page (int, optional): 페이지 번호 (기본값: 1)
        per_page (int, optional): 페이지당 항목 수 (기본값: 20, 최대: 100)
        
    Returns:
        JSON: 검색 결과와 페이지네이션 정보
    """
    # 쿼리 파라미터 처리 및 검증
    q = (request.args.get("q") or "").strip()
    page = max(int(request.args.get("page", 1)), 1)  # 최소 1페이지
    per_page = min(max(int(request.args.get("per_page", 12)), 1), 100)  # 1~100개 제한 (기본값: 12개)

    # LIKE 검색 대상: title, usage, mid
    like = f"%{q}%"
    base_sql = """
        FROM msds
        WHERE (:q = '' OR title LIKE :like OR `usage` LIKE :like OR mid LIKE :like)
    """

    # 전체 검색 결과 개수 조회
    cnt_sql = text(f"SELECT COUNT(*) AS cnt {base_sql}")
    total = db.session.execute(cnt_sql, {"q": q, "like": like}).scalar() or 0

    # 페이지네이션된 결과 조회
    off = (page - 1) * per_page  # 오프셋 계산
    rows_sql = text(f"""
        SELECT mid, title, `usage`, file_loc, is_osh, is_chr
        {base_sql}
        ORDER BY mid
        LIMIT :limit OFFSET :offset
    """)
    rows = db.session.execute(
        rows_sql,
        {"q": q, "like": like, "limit": per_page, "offset": off}
    ).mappings().all()

    # 검색 결과와 페이지네이션 정보 반환
    return jsonify({
        "items": [dict(r) for r in rows],  # 검색 결과 항목들
        "page": page,                       # 현재 페이지 번호
        "per_page": per_page,               # 페이지당 항목 수
        "total": total                      # 전체 검색 결과 개수
    })

# 3) PDF 다운로드 (Supabase Storage 서명 URL 발급 후 리다이렉트)
# GET /api/msds/<mid>/download
@msds_bp.get("/<mid>/download")
def download_msds(mid):
    """
    MSDS PDF 파일을 다운로드하는 엔드포인트
    Supabase Storage에서 서명된 URL을 생성하여 리다이렉트합니다.
    
    Args:
        mid (str): MSDS ID
        
    Query Parameters:
        download (str, optional): 강제 다운로드 옵션
        
    Returns:
        Redirect: Supabase 서명된 URL로 리다이렉트
    """
    # 데이터베이스에서 파일 경로 조회
    row = db.session.execute(
        text("SELECT file_loc FROM msds WHERE mid = :mid"),
        {"mid": mid}
    ).mappings().first()

    # MSDS 또는 파일이 존재하지 않는 경우 404 에러
    if not row or not row["file_loc"]:
        abort(404, description="MSDS or file not found")

    file_path = row["file_loc"]  # 예: "pdfs/1750328210807_hydrochloric-acid-35.pdf"

    # Supabase 설정값 가져오기
    bucket = current_app.config.get("SUPABASE_BUCKET", "msds")
    expires_in = int(current_app.config.get("SUPABASE_SIGNED_URL_EXPIRES", 300))

    # Supabase 클라이언트 생성
    sb = _get_supabase()

    # 서명된 URL 생성
    signed = sb.storage.from_(bucket).create_signed_url(file_path, expires_in)
    signed_url = signed.get("signed_url") or signed.get("signedURL")

    # 서명된 URL 생성 실패 시 404 에러
    if not signed_url:
        abort(404, description="Failed to create signed URL")

    # 다운로드 강제 옵션: download=1 이면 첨부로 강제 다운로드
    if request.args.get("download"):
        joiner = "&" if "?" in signed_url else "?"
        signed_url = f"{signed_url}{joiner}download=1"

    # 302 리다이렉트 (클라이언트가 Supabase 서명 URL로 직접 다운로드)
    return redirect(signed_url, code=302)

# 3-2) PDF 다운로드 (직접 파일 반환)   GET /api/msds/<mid>/pdf
@msds_bp.get("/<mid>/pdf")
def download_pdf_direct(mid):
    """
    MSDS PDF 파일을 직접 다운로드하는 엔드포인트
    
    Args:
        mid (str): MSDS ID
        
    Returns:
        File: PDF 파일 직접 반환
    """
    # 데이터베이스에서 파일 경로 조회
    row = db.session.execute(
        text("SELECT file_loc, title FROM msds WHERE mid = :mid"),
        {"mid": mid}
    ).mappings().first()

    # MSDS 또는 파일이 존재하지 않는 경우 404 에러
    if not row or not row["file_loc"]:
        abort(404, description="MSDS or file not found")

    file_path = row["file_loc"]

    # Supabase 설정값 가져오기
    bucket = current_app.config.get("SUPABASE_BUCKET", "msds")

    # Supabase 클라이언트 생성
    sb = _get_supabase()

    try:
        # Supabase에서 파일 내용을 직접 가져와서 반환
        file_response = sb.storage.from_(bucket).download(file_path)
        
        # 파일명 생성
        filename = f"{row['title']}_MSDS.pdf"
        
        # 파일을 직접 반환 (다운로드)
        from flask import Response
        return Response(
            file_response,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Type': 'application/pdf'
            }
        )
    except Exception as e:
        # 직접 다운로드 실패 시 기존 방식으로 대체
        return download_msds(mid)

# 4) 추가자료 이미지 다운로드 (Supabase Storage 서명 URL 발급 후 리다이렉트)
# GET /api/msds/<mid>/attachment/<aid>
@msds_bp.get("/<mid>/attachment/<int:aid>")
def download_attachment(mid, aid):
    """
    MSDS 추가자료(이미지)를 다운로드하는 엔드포인트
    Supabase Storage에서 서명된 URL을 생성하여 리다이렉트합니다.
    
    Args:
        mid (str): MSDS ID
        aid (int): 추가자료 ID
        
    Returns:
        Redirect: Supabase 서명된 URL로 리다이렉트
    """
    # 데이터베이스에서 추가자료 정보 조회
    row = db.session.execute(
        text("""
            SELECT i.file_loc, i.title 
            FROM msds_additional_info i
            JOIN msds_additional_relation r ON i.aid = r.aid
            WHERE r.mid = :mid AND i.aid = :aid
        """),
        {"mid": mid, "aid": aid}
    ).mappings().first()

    # 추가자료가 존재하지 않는 경우 404 에러
    if not row or not row["file_loc"] or row["file_loc"] == "None":
        abort(404, description="Attachment not found")

    file_path = row["file_loc"]  # 예: "msds/prgear/방독마스크.png"

    # Supabase 설정값 가져오기
    bucket = current_app.config.get("SUPABASE_BUCKET", "msds")
    expires_in = int(current_app.config.get("SUPABASE_SIGNED_URL_EXPIRES", 300))

    # Supabase 클라이언트 생성
    sb = _get_supabase()

    # 서명된 URL 생성
    signed = sb.storage.from_(bucket).create_signed_url(file_path, expires_in)
    signed_url = signed.get("signed_url") or signed.get("signedURL")

    # 서명된 URL 생성 실패 시 404 에러
    if not signed_url:
        abort(404, description="Failed to create signed URL")

    # 302 리다이렉트 (클라이언트가 Supabase 서명 URL로 직접 이미지 로드)
    return redirect(signed_url, code=302)