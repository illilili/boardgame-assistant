from db.db_connector import SessionLocal
from models.plan import Plan

db = SessionLocal()

plan = Plan(name="연금술사의 공방 기획안")
db.add(plan)
db.commit()
db.close()

print("✅ 샘플 Plan 삽입 완료")
