from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class LegalScenario(Base):
    __tablename__ = "legal_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    keywords = Column(Text, nullable=False)  # comma separated
    legal_basis = Column(Text, nullable=False)  # Articles / Sections
    rights_summary = Column(Text, nullable=False)
    authority = Column(String, nullable=True)