"""
Flask 확장 모듈
애플리케이션에서 사용하는 Flask 확장들을 초기화합니다.
"""

# extensions.py - db를 별도 모듈로 분리하기 (권장)
from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy 데이터베이스 인스턴스 생성
# 애플리케이션 팩토리 패턴에서 사용하기 위해 전역에서 생성
db = SQLAlchemy()
