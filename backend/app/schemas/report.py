from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ReportBase(BaseModel):
    title: str
    template_id: int
    data: Dict[str, Any]

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ReportInDBBase(ReportBase):
    id: int
    created_by: int
    status: str
    created_at: datetime
    generated_file_path: Optional[str] = None
    annotations: Optional[Any] = None

    class Config:
        from_attributes = True

class Report(ReportInDBBase):
    pass

class ApprovalCreate(BaseModel):
    status: str
    comments: Optional[str] = None
