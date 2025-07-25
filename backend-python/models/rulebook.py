from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from db.db_connector import Base

class Rulebook(Base):
    __tablename__ = "rulebook"

    rulebook_id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer)
    rule_set = Column(Text)
    win_condition = Column(Text)
    turn_order = Column(Text)
    created_at = Column(DateTime)
