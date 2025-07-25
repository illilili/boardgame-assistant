from db.db_connector import Base, engine
from models.rulebook import Rulebook
from models.content import Content

Base.metadata.create_all(bind=engine)
print("✅ 테이블 생성 완성")