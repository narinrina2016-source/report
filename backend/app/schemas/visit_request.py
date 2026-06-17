from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VisitRequestBase(BaseModel):
    visitor_type: Optional[str] = None
    school_name: Optional[str] = None
    organization_address: Optional[str] = None
    purpose: Optional[str] = None
    visit_date: datetime
    total_students: int
    female_students: int
    total_teachers: Optional[int] = 0
    female_teachers: Optional[int] = 0
    need_guide: bool
    guide_count: Optional[int] = 0
    contact_info: Optional[str] = None
    file_path: Optional[str] = None
    letter_number: Optional[str] = None
    comments: Optional[str] = None

class VisitRequestCreate(VisitRequestBase):
    pass

class VisitRequestUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    comments: Optional[str] = None

class VisitRequestResponse(VisitRequestBase):
    id: int
    status: str
    assigned_to: Optional[int] = None
    created_at: datetime
    tracking_token: Optional[str] = None

    class Config:
        orm_mode = True
