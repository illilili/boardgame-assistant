from db.db_connector import engine, Base
import models  # 이것만 있어도 __init__.py에 의해 모든 테이블 등록됨

Base.metadata.create_all(bind=engine)

print("✅ 데이터베이스 테이블 생성 완료")