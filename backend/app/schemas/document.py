from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    type: str
    reference_number: str
    title: str
    document_date: datetime
    institution: str
    file_path: Optional[str] = None
    status: Optional[str] = "Pending"
    notes: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_date: Optional[datetime] = None
    institution: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    file_path: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
