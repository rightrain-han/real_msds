#!/usr/bin/env python3
"""
이미지 파일 경로 수정 스크립트
잘못된 파일 경로를 가진 첨부파일들을 수정합니다.
"""

from flask import Flask
from config import Config
from extensions import db
from routes.msds import fetch_all, exec_write

def create_app():
    """Flask 애플리케이션 생성"""
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def fix_image_paths():
    """잘못된 이미지 파일 경로를 수정하는 함수"""
    app = create_app()
    
    with app.app_context():
        print("=== 이미지 파일 경로 수정 시작 ===")
        
        # 잘못된 파일 경로를 가진 첨부파일 조회
        problematic_files = fetch_all("""
            SELECT aid, title, type, file_loc
            FROM msds_additional_info
            WHERE file_loc = 'None' OR file_loc LIKE '%____%'
            ORDER BY aid
        """)
        
        print(f"수정이 필요한 파일 개수: {len(problematic_files)}")
        
        for file_info in problematic_files:
            aid = file_info['aid']
            title = file_info['title']
            file_type = file_info['type']
            current_path = file_info['file_loc']
            
            print(f"\nAID: {aid}, 제목: {title}, 타입: {file_type}")
            print(f"현재 경로: {current_path}")
            
            # 파일 경로 수정 로직
            new_path = None
            
            if file_type == "2":  # 경고표지
                # 경고표지에 대한 기본 이미지 경로 설정
                if "경고" in title:
                    new_path = "images/symbols/warning.png"
                elif "폭발성" in title:
                    new_path = "images/symbols/explosive.png"
                elif "독성" in title:
                    new_path = "images/symbols/toxic.png"
                elif "부식성" in title:
                    new_path = "images/symbols/corrosive.png"
                else:
                    new_path = "images/symbols/general_warning.png"
            
            elif file_type == "0":  # 보호장구
                # 보호장구에 대한 기본 이미지 경로 설정
                if "마스크" in title or "호흡" in title:
                    new_path = "images/equipment/respirator.png"
                elif "고글" in title or "안경" in title:
                    new_path = "images/equipment/goggles.png"
                elif "장갑" in title:
                    new_path = "images/equipment/gloves.png"
                elif "보호복" in title or "작업복" in title:
                    new_path = "images/equipment/protective_suit.png"
                else:
                    new_path = "images/equipment/general_protection.png"
            
            if new_path:
                # 파일 경로 업데이트
                exec_write(
                    "UPDATE msds_additional_info SET file_loc = :new_path WHERE aid = :aid",
                    {"new_path": new_path, "aid": aid}
                )
                print(f"수정된 경로: {new_path}")
            else:
                print("수정할 경로를 찾을 수 없음")
        
        print("\n=== 이미지 파일 경로 수정 완료 ===")

if __name__ == "__main__":
    fix_image_paths()

