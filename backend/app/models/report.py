from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    template_id = Column(Integer, ForeignKey("templates.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    editor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_head_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    president_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="Draft") # Expanded states
    reference_number = Column(String, nullable=True) # Finalized reference number
    qr_code_path = Column(String, nullable=True) # Optional QR Code image path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    data = Column(JSON) # JSON payload of filled form data
    generated_file_path = Column(String, nullable=True)
    html_content = Column(String, nullable=True) # For In-App Editor
    original_html_content = Column(String, nullable=True) # For diffing against Editor's changes
    annotations = Column(JSON, nullable=True) # Stores PDF highlights and comments
    
    template = relationship("Template", back_populates="reports")
    creator = relationship("User", foreign_keys=[created_by])
    editor = relationship("User", foreign_keys=[editor_id])
    department_head = relationship("User", foreign_keys=[department_head_id])
    admin = relationship("User", foreign_keys=[admin_id])
    president = relationship("User", foreign_keys=[president_id])
    approvals = relationship("Approval", back_populates="report")
    dispatches = relationship("ExternalDispatch", back_populates="report")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String) # Approved, Rejected, Revision Required
    comments = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="approvals")
    approver = relationship("User")

class ExternalDispatch(Base):
    __tablename__ = "external_dispatches"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    institution_name = Column(String)
    dispatch_method = Column(String)
    status = Column(String, default="Sent") # Sent, Received
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    received_at = Column(DateTime(timezone=True), nullable=True)
    dispatch_photo = Column(String, nullable=True) # Base64
    receive_photo = Column(String, nullable=True) # Base64

    report = relationship("Report", back_populates="dispatches")
