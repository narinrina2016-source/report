from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from app.api import deps
from app.models.report import Report
from app.services.archive_service import archive_reports

router = APIRouter()

class ArchiveRequest(BaseModel):
    report_ids: List[int]
    archive_name: str = None

@router.post("/")
def create_archive(
    request: ArchiveRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """
    Archive multiple reports into a zip file.
    """
    reports = db.query(Report).filter(Report.id.in_(request.report_ids)).all()
    
    paths_to_archive = []
    for report in reports:
        if report.generated_file_path:
            paths_to_archive.append(report.generated_file_path)
            
    if not paths_to_archive:
        raise HTTPException(status_code=400, detail="No generated files found for the given report IDs.")
        
    archive_path = archive_reports(paths_to_archive, request.archive_name)
    
    return {"message": "Archive created successfully", "archive_path": archive_path}
