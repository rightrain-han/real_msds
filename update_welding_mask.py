#!/usr/bin/env python3
"""
용접용보안면 파일 경로 업데이트 스크립트
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# .env 파일 로드
load_dotenv()

# 데이터베이스 연결
db_uri = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

engine = create_engine(db_uri)

def update_welding_mask():
    """용접용보안면의 파일 경로를 실제 파일명으로 업데이트합니다."""
    
    with engine.connect() as conn:
        # 현재 데이터 확인
        current_data = conn.execute(text("""
            SELECT aid, title, file_loc FROM msds_additional_info 
            WHERE title = '용접용보안면'
        """)).fetchall()
        
        print("현재 용접용보안면 데이터:")
        for row in current_data:
            print(f"AID: {row.aid}, 제목: {row.title}, 파일경로: {row.file_loc}")
        
        # 파일 경로 업데이트
        result = conn.execute(text("""
            UPDATE msds_additional_info 
            SET file_loc = 'images/protective/1750396936553__________________.png'
            WHERE title = '용접용보안면'
        """))
        
        conn.commit()
        
        print(f"\n업데이트 완료: {result.rowcount}개 행이 수정되었습니다.")
        
        # 업데이트 후 데이터 확인
        updated_data = conn.execute(text("""
            SELECT aid, title, file_loc FROM msds_additional_info 
            WHERE title = '용접용보안면'
        """)).fetchall()
        
        print("\n업데이트 후 용접용보안면 데이터:")
        for row in updated_data:
            print(f"AID: {row.aid}, 제목: {row.title}, 파일경로: {row.file_loc}")

if __name__ == "__main__":
    update_welding_mask()

