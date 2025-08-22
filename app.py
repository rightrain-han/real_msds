"""
MSDS 안전관리시스템 Flask 애플리케이션
Material Safety Data Sheet Management System Backend

이 파일은 Flask 애플리케이션의 메인 진입점입니다.
애플리케이션 팩토리 패턴을 사용하여 애플리케이션을 생성합니다.
"""

import os
from flask import Flask, jsonify, send_from_directory, redirect
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS

from config import Config
from extensions import db  # extensions.py에 db = SQLAlchemy()만 있어야 합니다.

def create_app():
    """
    Flask 애플리케이션 팩토리 함수
    애플리케이션 인스턴스를 생성하고 설정을 적용합니다.
    
    Returns:
        Flask: 설정된 Flask 애플리케이션 인스턴스
    """
    # Flask 애플리케이션 인스턴스 생성
    app = Flask(__name__)
    # 설정 객체에서 애플리케이션 설정 로드
    app.config.from_object(Config)

    # CORS (Cross-Origin Resource Sharing) 설정
    # 프론트엔드에서 API 호출을 허용하기 위한 설정
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},  # 모든 API 경로에 대해 모든 도메인 허용
        expose_headers=["Content-Disposition"]    # 파일 다운로드를 위한 헤더 노출
    )

    # 한글 JSON 응답을 위한 설정
    # 기본적으로 Flask는 ASCII로만 JSON을 인코딩하므로 한글 지원을 위해 False로 설정
    app.config["JSON_AS_ASCII"] = False

    # 데이터베이스 초기화 (여기서 "한 번만" 실행)
    db.init_app(app)

    # 블루프린트 등록 - MSDS 관련 라우트들을 /api/msds 경로에 등록
    from routes.msds import msds_bp
    app.register_blueprint(msds_bp, url_prefix="/api/msds")

    # 헬스체크 엔드포인트 - 서비스 상태 확인용
    @app.get("/healthz")
    def healthz():
        """서비스 상태를 확인하는 헬스체크 엔드포인트"""
        return jsonify({"status": "ok"})

    # 루트 경로 → Swagger 문서로 리다이렉트
    @app.get("/")
    def index():
        """루트 경로 접속 시 Swagger 문서로 리다이렉트"""
        return redirect(app.config.get("SWAGGER_URL", "/docs"), code=302)

    # Swagger UI 설정 및 등록
    SWAGGER_URL = app.config.get("SWAGGER_URL", "/docs")  # Swagger UI 접속 경로
    API_SPEC_PATH = app.config.get("OPENAPI_SPEC_PATH", "/openapi.yaml")  # OpenAPI 스펙 파일 경로

    # Swagger UI 블루프린트 생성
    swaggerui_bp = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_SPEC_PATH,
        config={"app_name": "MSDS API"}
    )
    app.register_blueprint(swaggerui_bp, url_prefix=SWAGGER_URL)

    # OpenAPI 스펙 파일 서빙 엔드포인트
    @app.get(API_SPEC_PATH)
    def serve_openapi():
        """OpenAPI 스펙 파일을 제공하는 엔드포인트"""
        return send_from_directory(
            directory=os.getcwd(),  # 현재 작업 디렉토리
            path="openapi.yaml",    # OpenAPI 스펙 파일명
            mimetype="text/yaml"    # YAML 파일 타입
        )

    return app

# ⛔️ 여기서 app = create_app() 하지 않습니다.
# 애플리케이션 팩토리 패턴을 사용하므로 전역에서 앱을 생성하지 않습니다.

if __name__ == "__main__":
    """
    직접 실행 시에만 애플리케이션을 생성하고 실행합니다.
    python app.py 명령으로 실행할 때만 이 블록이 실행됩니다.
    """
    # 애플리케이션 팩토리 함수를 호출하여 앱 생성
    app = create_app()
    # 개발 서버 실행 (모든 IP에서 접근 가능, 포트 5001, 디버그 모드 활성화)
    app.run(host="0.0.0.0", port=5001, debug=True)
