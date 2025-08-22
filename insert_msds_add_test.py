import pymysql
import openpyxl

# MySQL 데이터베이스 연결
try:
    con = pymysql.connect(
        host="localhost",
        user="admin_test",
        password="admin_test",
        db="MSDS_DB_TEST",
        charset="utf8mb4",
    )
    print("Database connection successful.")
except pymysql.MySQLError as e:
    print(f"Error connecting to the database: {e}")
    exit()

# 커서 생성
cur = con.cursor()

# 엑셀 파일 열기
try:
    workbook = openpyxl.load_workbook("../downloads/msds_additional_info.xlsx")
    sheet = workbook.active
    print("Excel file loaded successfully.")
except FileNotFoundError as e:
    print(f"Error loading Excel file: {e}")
    exit()

# 데이터 읽기
data = list(sheet.iter_rows(values_only=True))[1:]  # 첫 행 제외 (헤더 제외)

try:
    for row in data:
        aid = row[0]
        title = row[1]
        type = row[2]
        file_loc = row[3]

        # Insert data into the database
        sql = f"""
        INSERT INTO msds_additional_info_test(aid, title, type, file_loc)
        VALUES ({aid}, '{title}', {type}, '{file_loc}');
        """
        cur.execute(sql)
        print(sql)

    # Commit the transaction
    con.commit()

except pymysql.MySQLError as e:
    print(f"Error executing query: {e}")
    con.rollback()
finally:
    cur.close()
    con.close()
    print("Database connection closed.")
