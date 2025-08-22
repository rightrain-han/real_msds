# MSDS 안전관리시스템

Material Safety Data Sheet (MSDS) 관리를 위한 웹 애플리케이션입니다.

## 🚀 주요 기능

- **MSDS 관리**: 물질안전보건자료 등록, 조회, 수정, 삭제
- **PDF 관리**: PDF 파일 업로드, 다운로드, 삭제
- **추가자료 관리**: 보호장구, 경고표지, 장소 정보 관리
- **검색 기능**: 키워드 기반 MSDS 검색
- **페이지네이션**: 효율적인 데이터 탐색
- **API 문서**: Swagger UI를 통한 API 문서 제공

## 🛠 기술 스택

### 백엔드
- **Python 3.x**
- **Flask**: 웹 프레임워크
- **SQLAlchemy**: ORM
- **Flask-CORS**: CORS 지원
- **Supabase**: 클라우드 데이터베이스 및 스토리지

### 프론트엔드
- **Next.js 15.4.7**: React 프레임워크
- **React 19.1.0**: UI 라이브러리
- **Tailwind CSS**: 스타일링

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd real_msds
```

### 2. 백엔드 설정
```bash
# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate  # Windows

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정 (필요시)
cp .env.example .env
# .env 파일에서 데이터베이스 및 Supabase 설정 수정

# 백엔드 실행
python app.py
```

### 3. 프론트엔드 설정
```bash
cd frontend

# 패키지 설치
npm install

# 프론트엔드 실행
npm run dev
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **API 문서**: http://localhost:5001/docs
- **헬스체크**: http://localhost:5001/healthz

## 📊 API 엔드포인트

### MSDS 관리
- `GET /api/msds` - MSDS 목록 조회 (페이지네이션)
- `POST /api/msds` - MSDS 생성
- `GET /api/msds/{mid}` - MSDS 상세 조회
- `PUT /api/msds/{mid}` - MSDS 수정
- `DELETE /api/msds/{mid}` - MSDS 삭제

### 검색 및 옵션
- `GET /api/msds/search` - MSDS 검색
- `GET /api/msds/options` - 옵션 데이터 조회

### PDF 관리
- `GET /api/msds/{mid}/pdf` - PDF 직접 다운로드
- `POST /api/msds/{mid}/pdf` - PDF 업로드
- `DELETE /api/msds/{mid}/pdf` - PDF 삭제
- `GET /api/msds/{mid}/download` - PDF 서명 URL 다운로드

### 추가자료 관리
- `GET /api/msds/additional-info` - 추가자료 목록 조회
- `POST /api/msds/additional-info` - 추가자료 생성
- `PUT /api/msds/additional-info/{aid}` - 추가자료 수정
- `DELETE /api/msds/additional-info/{aid}` - 추가자료 삭제

### 첨부파일
- `GET /api/msds/{mid}/attachment/{aid}` - 첨부파일 다운로드

## 📁 프로젝트 구조

```
real_msds/
├── app.py                 # Flask 애플리케이션 메인
├── config.py              # 설정 파일
├── extensions.py          # Flask 확장 모듈
├── openapi.yaml          # API 문서
├── requirements.txt      # Python 패키지 목록
├── models/               # 데이터 모델
├── routes/               # API 라우트
├── services/             # 비즈니스 로직
├── frontend/             # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/         # Next.js 앱 라우터
│   │   ├── components/  # React 컴포넌트
│   │   └── lib/         # 유틸리티 함수
│   └── package.json
└── README.md
```

## 🔧 개발 가이드

### 환경변수 설정
다음 환경변수들을 설정해야 합니다:

```env
# 데이터베이스 설정
DATABASE_URL=your_database_url

# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=msds

# Flask 설정
FLASK_ENV=development
SECRET_KEY=your_secret_key
```

### 데이터베이스 스키마
- `msds`: MSDS 기본 정보
- `msds_additional_info`: 추가자료 정보
- `msds_additional_relation`: MSDS와 추가자료 관계

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 언제든 연락주세요.
