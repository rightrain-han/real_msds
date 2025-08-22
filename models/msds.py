"""
MSDS 데이터 모델
Material Safety Data Sheet의 데이터베이스 모델을 정의합니다.
"""

from extensions import db

class Msds(db.Model):
    """
    MSDS 데이터 모델 클래스
    화학물질의 안전보건자료 정보를 저장합니다.
    """
    __tablename__ = "msds"

    # PK를 문자열 mid로 사용 (예: "M0001")
    mid = db.Column(db.String(20), primary_key=True)
    # MSDS 제목 (필수)
    title = db.Column(db.String(255), nullable=False)
    # 화학물질 용도 (선택)
    usage = db.Column(db.String(255), nullable=True)
    # PDF 파일 경로 (선택) - 예: "msds/xxx.pdf"
    file_loc = db.Column(db.String(1024), nullable=True)
    # 화학물질관리법 적용 여부 (기본값: False)
    is_chr = db.Column(db.Boolean, nullable=False, default=False)
    # 산업안전보건법 적용 여부 (기본값: False)
    is_osh = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        """
        MSDS 객체를 딕셔너리로 변환하는 메서드
        
        Returns:
            dict: MSDS 데이터를 담은 딕셔너리
        """
        return {
            "mid": self.mid,
            "title": self.title,
            "usage": self.usage,
            "file_loc": self.file_loc,
            "is_chr": self.is_chr,
            "is_osh": self.is_osh,
        }
