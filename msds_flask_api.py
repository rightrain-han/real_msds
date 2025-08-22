from flask import Flask, request, jsonify  # Flask 라이브러리에서 웹 앱, 요청 처리, JSON 응답 기능을 가져옵니다
import pymysql  # MySQL과 연동하기 위한 라이브러리입니다

def create_app():  # Flask 애플리케이션을 생성하는 함수입니다
    app = Flask(__name__)  # Flask 인스턴스를 생성합니다

    def get_db_connection():  # MySQL DB 연결을 반환하는 함수입니다
        return pymysql.connect(
            host="localhost",  # 데이터베이스 호스트 주소
            user="root",      # DB 사용자 계정
            password="Gks48620%",  # DB 사용자 비밀번호
            db="MSDS_DB",      # 사용할 DB 이름
            charset="utf8mb4", # 문자셋 설정
            cursorclass=pymysql.cursors.DictCursor  # 결과를 dict 형태로 반환하여 JSON 변환에 용이
        )

    @app.route('/msds', methods=['GET'])  # 전체 MSDS 데이터를 조회하는 엔드포인트입니다
    def get_all_msds():
        with get_db_connection() as con:  # DB 연결을 열고
            with con.cursor() as cur:     # 커서를 생성하여
                cur.execute("SELECT * FROM msds")  # 전체 MSDS 데이터를 조회합니다
                rows = cur.fetchall()  # 조회 결과를 rows에 저장합니다
        return jsonify(rows)  # JSON 형태로 반환합니다

    @app.route('/msds/<mid>', methods=['GET'])  # 특정 MSDS 데이터 조회
    def get_msds(mid):
        with get_db_connection() as con:
            with con.cursor() as cur:
                cur.execute("SELECT * FROM msds WHERE mid = %s", (mid,))  # 특정 mid를 가진 데이터를 조회합니다
                row = cur.fetchone()  # 단일 결과를 가져옵니다
        if row:
            return jsonify(row)  # 데이터가 있으면 반환
        else:
            return jsonify({'message': 'MSDS not found'}), 404  # 없으면 404 반환

    @app.route('/msds', methods=['POST'])  # MSDS 데이터를 새로 등록하는 엔드포인트
    def create_msds():
        data = request.json  # 클라이언트에서 JSON 데이터를 받아옵니다
        with get_db_connection() as con:
            with con.cursor() as cur:
                sql = """
                    INSERT INTO msds_test (mid, title, usage, file_loc, is_osh, is_chr)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """  # INSERT 쿼리 준비
                cur.execute(sql, (data['mid'], data['title'], data['usage'], data['file_loc'], data['is_osh'], data['is_chr']))  # 데이터 삽입
            con.commit()  # 변경사항을 DB에 반영
        return jsonify({'message': 'MSDS created successfully'}), 201  # 성공 메시지 반환

    @app.route('/msds/<mid>', methods=['PUT'])  # 특정 MSDS 데이터를 업데이트하는 엔드포인트
    def update_msds(mid):
        data = request.json
        with get_db_connection() as con:
            with con.cursor() as cur:
                sql = """
                    UPDATE msds_test SET title=%s, usage=%s, file_loc=%s, is_osh=%s, is_chr=%s WHERE mid=%s
                """  # UPDATE 쿼리 준비
                cur.execute(sql, (data['title'], data['usage'], data['file_loc'], data['is_osh'], data['is_chr'], mid))  # 데이터 업데이트
            con.commit()
        return jsonify({'message': 'MSDS updated successfully'})  # 성공 메시지 반환

    @app.route('/msds/<mid>', methods=['DELETE'])  # 특정 MSDS 데이터를 삭제하는 엔드포인트
    def delete_msds(mid):
        with get_db_connection() as con:
            with con.cursor() as cur:
                cur.execute("DELETE FROM msds_test WHERE mid = %s", (mid,))  # 특정 mid의 데이터를 삭제
            con.commit()
        return jsonify({'message': 'MSDS deleted successfully'})

    @app.route('/msds_additional_info', methods=['GET'])  # MSDS 부가정보 전체 조회 엔드포인트
    def get_all_additional():
        with get_db_connection() as con:
            with con.cursor() as cur:
                cur.execute("SELECT * FROM msds_additional_info")  # 전체 부가정보 조회
                rows = cur.fetchall()
        return jsonify(rows)

    @app.route('/msds_additional_info', methods=['POST'])  # MSDS 부가정보 등록 엔드포인트
    def create_additional():
        data = request.json
        with get_db_connection() as con:
            with con.cursor() as cur:
                sql = """
                    INSERT INTO msds_additional_info (aid, title, type, file_loc)
                    VALUES (%s, %s, %s, %s)
                """  # INSERT 쿼리 준비
                cur.execute(sql, (data['aid'], data['title'], data['type'], data['file_loc']))  # 데이터 삽입
            con.commit()
        return jsonify({'message': 'MSDS additional info created successfully'}), 201

    @app.route('/msds_additional_info/<aid>', methods=['PUT'])  # MSDS 부가정보 업데이트 엔드포인트
    def update_additional(aid):
        data = request.json
        with get_db_connection() as con:
            with con.cursor() as cur:
                sql = """
                    UPDATE msds_additional_info SET title=%s, type=%s, file_loc=%s WHERE aid=%s
                """  # UPDATE 쿼리 준비
                cur.execute(sql, (data['title'], data['type'], data['file_loc'], aid))  # 데이터 업데이트
            con.commit()
        return jsonify({'message': 'MSDS additional info updated successfully'})

    @app.route('/msds_additional/<aid>', methods=['DELETE'])  # MSDS 부가정보 삭제 엔드포인트
    def delete_additional(aid):
        with get_db_connection() as con:
            with con.cursor() as cur:
                cur.execute("DELETE FROM msds_additional_info_test WHERE aid = %s", (aid,))  # 데이터 삭제
            con.commit()
        return jsonify({'message': 'MSDS additional info deleted successfully'})

    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({"status": "MSDS Flask API is running"}), 200


    return app  # app 객체를 반환하여 다른 서버에서 사용할 수 있도록 합니다

app = create_app()  # Flask 앱을 생성하여 다른 서버(Gunicorn 등)에서 실행 가능하게 합니다