from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.visit_request import VisitRequest
from app.models.user import User
from app.models.document import Document
from app.schemas.visit_request import VisitRequestCreate, VisitRequestUpdate, VisitRequestResponse
from app.utils.telegram import send_telegram_message

router = APIRouter()

@router.get("/", response_model=List[VisitRequestResponse])
def get_visit_requests(
    db: Session = Depends(deps.get_db),
    status: str = None,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve visit requests. Admin sees all, Department Head sees assigned.
    """
    print(f"DEBUG: get_visit_requests called by user: {current_user.email} (Role: {current_user.role}, ID: {current_user.id})")
    query = db.query(VisitRequest)
    
    if current_user.role == "Department Head":
        query = query.filter(VisitRequest.assigned_to == current_user.id)
        
    if status:
        query = query.filter(VisitRequest.status == status)
        
    requests = query.order_by(VisitRequest.created_at.desc()).all()
    print(f"DEBUG: returning {len(requests)} requests for user {current_user.email}")
    return requests

@router.post("/public", response_model=VisitRequestResponse)
def create_visit_request_public(
    *,
    db: Session = Depends(deps.get_db),
    req_in: VisitRequestCreate
) -> Any:
    """
    Create new visit request from public form. No auth required.
    """
    req = VisitRequest(
        visitor_type=req_in.visitor_type,
        school_name=req_in.school_name,
        organization_address=req_in.organization_address,
        purpose=req_in.purpose,
        visit_date=req_in.visit_date,
        total_students=req_in.total_students,
        female_students=req_in.female_students,
        total_teachers=req_in.total_teachers,
        female_teachers=req_in.female_teachers,
        need_guide=req_in.need_guide,
        guide_count=req_in.guide_count,
        contact_info=req_in.contact_info,
        file_path=req_in.file_path,
        letter_number=req_in.letter_number,
        comments=req_in.comments,
        status="Pending",
        tracking_token=str(uuid.uuid4())
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    
    # Also create an Incoming Document
    new_doc = Document(
        type="Incoming",
        reference_number=req_in.letter_number or f"VR-{req.tracking_token[:8].upper()}",
        title=f"សំណើសុំទស្សនកិច្ចពី {req.school_name}",
        institution=req.school_name,
        document_date=req.created_at or __import__("datetime").datetime.utcnow(),
        status="Pending",
        file_path=req.file_path,
        notes=f"ប្រភេទអ្នកមកទស្សនា៖ {req.visitor_type}\nគោលបំណង៖ {req.purpose}\nថ្ងៃទស្សនកិច្ច៖ {req.visit_date}"
    )
    db.add(new_doc)
    db.commit()
    
    # Send Telegram Notification
    guide_text = f"មាន ({req.guide_count} នាក់)" if req.need_guide else "គ្មាន"
    msg = (
        f"🚨 <b>មានសំណើសុំទស្សនកិច្ចថ្មី!</b>\n\n"
        f"<b>ប្រភេទ៖</b> {req.visitor_type}\n"
        f"<b>ស្ថាប័ន៖</b> {req.school_name}\n"
        f"<b>កាលបរិច្ឆេទ៖</b> {req.visit_date.strftime('%Y-%m-%d %H:%M')}\n"
        f"<b>សិស្សសរុប៖</b> {req.total_students} នាក់ (ស្រី {req.female_students})\n"
        f"<b>គ្រូសរុប៖</b> {req.total_teachers} នាក់ (ស្រី {req.female_teachers})\n"
        f"<b>ត្រូវការមគ្គុទ្ទេសក៍៖</b> {guide_text}\n"
        f"<b>ទំនាក់ទំនង៖</b> {req.contact_info}\n\n"
        f"សូមចូលទៅកាន់ប្រព័ន្ធ ARMS ដើម្បីពិនិត្យមើល!"
    )
    send_telegram_message(msg)
    
    return req

@router.get("/track/{token}", response_model=VisitRequestResponse)
def track_visit_request(
    *,
    db: Session = Depends(deps.get_db),
    token: str
) -> Any:
    """
    Track a visit request by token.
    """
    req = db.query(VisitRequest).filter(VisitRequest.tracking_token == token).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

@router.put("/{id}/assign", response_model=VisitRequestResponse)
def assign_visit_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    assigned_to: int
) -> Any:
    """
    Assign a visit request to a department head.
    """
    req = db.query(VisitRequest).filter(VisitRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.assigned_to = assigned_to
    req.status = "Assigned"
    db.commit()
    db.refresh(req)
    return req

@router.put("/{id}/decide", response_model=VisitRequestResponse)
def decide_visit_request(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    status: str, # "Approved" or "Rejected"
    comments: str = None
) -> Any:
    """
    Approve or reject a visit request and notify.
    """
    req = db.query(VisitRequest).filter(VisitRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = status
    if comments:
        req.comments = comments
    db.commit()
    db.refresh(req)
    
    # Update corresponding Document status
    doc_ref = req.letter_number or f"VR-{req.tracking_token[:8].upper()}"
    doc = db.query(Document).filter(Document.reference_number == doc_ref).first()
    if doc:
        doc.status = status
        db.commit()
    
    # Send Telegram Notification back to group
    status_icon = "✅ អនុម័ត" if status == "Approved" else "❌ បដិសេធ"
    msg = (
        f"📝 <b>លទ្ធផលនៃសំណើសុំទស្សនកិច្ច៖</b>\n\n"
        f"<b>សាលា/ស្ថាប័ន៖</b> {req.school_name}\n"
        f"<b>សេចក្តីសម្រេច៖</b> {status_icon}\n"
        f"<b>មតិយោបល់៖</b> {comments or 'គ្មាន'}\n\n"
        f"<i>ប្រព័ន្ធនឹងជូនដំណឹងទៅកាន់អ្នកស្នើសុំតាមរយៈ: {req.contact_info}</i>"
    )
    send_telegram_message(msg)
    
    # Note: If the contact_info is a Telegram Chat ID, we could send directly to them.
    # For now, if it's numeric and starts with a number, we can try to send it as chat_id.
    if req.contact_info.isdigit() or (req.contact_info.startswith('-') and req.contact_info[1:].isdigit()):
        user_msg = (
            f"គោរពជូន <b>{req.school_name}</b>,\n\n"
            f"សំណើសុំទស្សនកិច្ចរបស់អ្នកត្រូវបាន <b>{status_icon}</b> រួចរាល់។\n"
            f"មតិយោបល់៖ {comments or 'គ្មាន'}\n\n"
            f"សូមអរគុណ!"
        )
        send_telegram_message(user_msg, chat_id=req.contact_info)
        
    return req
