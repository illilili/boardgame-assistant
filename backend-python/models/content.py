#설명 스크립트 저장 모델
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from db.db_connector import Base

class Content(Base):
    __tablename__ = "content"
    content_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, )
    plan_id = Column(Integer,)
    contentType = Column(String(100))
    data = Column(Text)
    created_at = Column(DateTime)
    submitted_at = Column(DateTime)
