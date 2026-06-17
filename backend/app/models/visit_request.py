from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class VisitRequest(Base):
    __tablename__ = "visit_requests"

    id = Column(Integer, primary_key=True, index=True)
    visitor_type = Column(String, default="Educational Institution")
    school_name = Column(String, index=True)
    organization_address = Column(String, nullable=True)
    purpose = Column(String)
    visit_date = Column(DateTime(timezone=True))
    total_students = Column(Integer, default=0)
    female_students = Column(Integer, default=0)
    total_teachers = Column(Integer, default=0, nullable=True)
    female_teachers = Column(Integer, default=0, nullable=True)
    need_guide = Column(Boolean, default=False)
    guide_count = Column(Integer, default=0, nullable=True)
    file_path = Column(String, nullable=True) # Official letter upload
    letter_number = Column(String, nullable=True) # លេខលិខិតចូល
    contact_info = Column(String) # Telegram/Phone/Email
    tracking_token = Column(String, unique=True, index=True, nullable=True)
    
    status = Column(String, default="Pending") # Pending, Assigned, Approved, Rejected
    comments = Column(String, nullable=True)
    
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    assignee = relationship("User", foreign_keys=[assigned_to])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
