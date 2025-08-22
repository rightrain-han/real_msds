"""
MSDS 안전관리시스템 설정 파일
애플리케이션의 모든 설정값들을 관리합니다.
"""

import os
from dotenv import load_dotenv

# .env 파일에서 환경변수 로드
load_dotenv()

class Config:
    """
    애플리케이션 설정 클래스
    데이터베이스, Swagger, Supabase 등의 설정을 관리합니다.
    """
    
    # SQLAlchemy (MySQL) 데이터베이스 설정
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    # SQLAlchemy 변경 추적 비활성화 (성능 향상을 위해)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Swagger API 문서 설정
    SWAGGER_URL = os.getenv("SWAGGER_URL", "/docs")  # Swagger UI 접속 경로
    OPENAPI_SPEC_PATH = os.getenv("OPENAPI_SPEC_PATH", "/openapi.yaml")  # OpenAPI 스펙 파일 경로

    # Supabase 클라우드 스토리지 설정
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")  # Supabase 프로젝트 URL
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")  # 서비스 롤 키
    SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "msds")  # 스토리지 버킷명
    SUPABASE_SIGNED_URL_EXPIRES = int(os.getenv("SUPABASE_SIGNED_URL_EXPIRES", "300"))  # 서명 URL 만료 시간(초)
