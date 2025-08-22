"""
MSDS 서비스 모듈
MSDS 관련 비즈니스 로직을 처리하는 서비스 함수들을 정의합니다.
"""

from sqlalchemy import or_
from extensions import db
from models.msds import Msds
from flask import current_app

def paginate_query(query, page: int, per_page: int):
    """
    쿼리 결과를 페이지네이션하는 헬퍼 함수
    
    Args:
        query: SQLAlchemy 쿼리 객체
        page (int): 페이지 번호
        per_page (int): 페이지당 항목 수
        
    Returns:
        tuple: (전체 개수, 현재 페이지 항목들)
    """
    # 페이지 번호 검증 및 보정
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = current_app.config.get("DEFAULT_PER_PAGE", 12)
    
    # 전체 개수 조회
    total = query.count()
    # 현재 페이지 항목들 조회
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return total, items

def get_msds_list(page: int, per_page: int = 12):
    """
    MSDS 목록을 페이지네이션하여 조회하는 함수
    
    Args:
        page (int): 페이지 번호
        per_page (int): 페이지당 항목 수 (기본값: 12개)
        
    Returns:
        dict: 페이지네이션 정보와 MSDS 목록
    """
    # MSDS 쿼리 생성 (mid 기준 오름차순 정렬)
    q = Msds.query.order_by(Msds.mid.asc())
    total, items = paginate_query(q, page, per_page)

    return {
        "page": page,
        "per_page": per_page,
        "total": total,
        "items": [m.to_dict() for m in items]  # 각 MSDS 객체를 딕셔너리로 변환
    }

def get_msds_detail(mid: str):
    """
    특정 MSDS의 상세 정보를 조회하는 함수
    
    Args:
        mid (str): MSDS ID
        
    Returns:
        Msds or None: MSDS 객체 또는 None
    """
    return Msds.query.filter_by(mid=mid).first()

def search_msds(keyword: str, page: int, per_page: int = 12):
    """
    MSDS를 키워드로 검색하는 함수
    
    Args:
        keyword (str): 검색 키워드
        page (int): 페이지 번호
        per_page (int): 페이지당 항목 수 (기본값: 12개)
        
    Returns:
        dict: 검색 결과와 페이지네이션 정보
    """
    q = Msds.query
    
    # 키워드가 있는 경우 LIKE 검색 수행
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(
            or_(
                Msds.title.ilike(like),    # 제목에서 검색
                Msds.usage.ilike(like),    # 용도에서 검색
                Msds.mid.ilike(like)       # MSDS ID에서 검색
            )
        )
    
    # mid 기준 오름차순 정렬
    q = q.order_by(Msds.mid.asc())
    total, items = paginate_query(q, page, per_page)

    return {
        "page": page,
        "per_page": per_page,
        "total": total,
        "items": [m.to_dict() for m in items]  # 각 MSDS 객체를 딕셔너리로 변환
    }
