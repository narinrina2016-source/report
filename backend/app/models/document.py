from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True) # "Incoming" or "Outgoing"
    reference_number = Column(String, index=True)
    title = Column(String)
    document_date = Column(DateTime(timezone=True))
    institution = Column(String)
    file_path = Column(String, nullable=True) # Path or Base64 of the uploaded file
    status = Column(String, default="Pending") # Pending, Processing, Completed
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
