from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.models.report import Report, Approval, ExternalDispatch
from app.models.template import Template
from app.schemas.report import Report as ReportSchema, ReportCreate, ApprovalCreate
from app.services.report_generator import generate_docx_report, convert_docx_to_pdf

router = APIRouter()

@router.post("/", response_model=ReportSchema)
def create_report(
    *,
    db: Session = Depends(deps.get_db),
    report_in: ReportCreate
) -> Any:
    """
    Create a new report, fill data into DOCX template.
    """
    template = db.query(Template).filter(Template.id == report_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    report = Report(
        title=report_in.title,
        template_id=report_in.template_id,
        created_by=1, # Mock user ID since we removed current_user
        data=report_in.data,
        status="Draft"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Auto Reference Numbering logic
    year = datetime.now().strftime("%y")
    ref_number = f"{report.id:03d}/{year} របក"
    
    report_data = dict(report.data) if report.data else {}
    report_data["ReferenceNumber"] = ref_number
    report.data = report_data
    
    # Generate the physical DOCX file using docxtpl
    if template.file_path and os.path.exists(template.file_path):
        try:
            output_path = generate_docx_report(
                template_path=template.file_path,
                context=report.data,
                report_id=report.id
            )
            report.generated_file_path = output_path
            db.commit()
            db.refresh(report)
        except Exception as e:
            print(f"Error generating DOCX: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate report document: {e}")
    else:
        raise HTTPException(status_code=400, detail="Template file is missing. Please upload a .docx file for this template first.")
        
    return report

@router.put("/{report_id}", response_model=ReportSchema)
def update_report(
    *,
    report_id: int,
    db: Session = Depends(deps.get_db),
    report_in: ReportCreate
) -> Any:
    """
    Update an existing report and regenerate the DOCX file.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    template = db.query(Template).filter(Template.id == report_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    report.title = report_in.title
    report.template_id = report_in.template_id
    
    # Maintain or generate Reference Number
    report_data = dict(report_in.data) if report_in.data else {}
    if "ReferenceNumber" not in report_data:
        year = datetime.now().strftime("%y")
        report_data["ReferenceNumber"] = f"{report.id:03d}/{year} របក"
        
    report.data = report_data
    report.annotations = [] # Clear annotations since the document is changing
    
    # Regenerate the physical DOCX file
    if template.file_path and os.path.exists(template.file_path):
        try:
            output_path = generate_docx_report(
                template_path=template.file_path,
                context=report.data,
                report_id=report.id
            )
            report.generated_file_path = output_path
        except Exception as e:
            print(f"Error regenerating DOCX: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to regenerate report document: {e}")
    else:
        raise HTTPException(status_code=400, detail="Template file is missing.")
        
    db.commit()
    db.refresh(report)
    return report


@router.post("/{report_id}/approve", response_model=ReportSchema)
def approve_report(
    *,
    report_id: int,
    db: Session = Depends(deps.get_db),
    approval_in: ApprovalCreate
) -> Any:
    """
    Approve or reject a report (Workflow).
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    approval = Approval(
        report_id=report.id,
        approver_id=1, # Mock user ID
        status=approval_in.status,
        comments=approval_in.comments
    )
    db.add(approval)
    
    # Update report status based on workflow rules
    report.status = approval_in.status
    
    if report.status == "Approved" and report.generated_file_path and report.generated_file_path.endswith('.docx'):
        try:
            # Re-generate the DOCX with the signature
            template = db.query(Template).filter(Template.id == report.template_id).first()
            if template and template.file_path and os.path.exists(template.file_path):
                new_docx_path = generate_docx_report(
                    template_path=template.file_path,
                    context=report.data,
                    report_id=report.id,
                    include_signature=True
                )
                report.generated_file_path = new_docx_path
                
            # Convert the signed DOCX to PDF
            pdf_path = convert_docx_to_pdf(report.generated_file_path)
            report.generated_file_path = pdf_path
        except Exception as e:
            print(f"Error converting to PDF: {e}")
            
    db.commit()
    db.refresh(report)
    
    return report

@router.get("/", response_model=List[ReportSchema])
def get_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    List all reports.
    """
    reports = db.query(Report).offset(skip).limit(limit).all()
    return reports

import mammoth
from pydantic import BaseModel

class HTMLUpdate(BaseModel):
    html_content: str

class AnnotationsUpdate(BaseModel):
    annotations: list

@router.get("/{report_id}/annotations")
def get_report_annotations(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"annotations": report.annotations or []}

@router.put("/{report_id}/annotations")
def update_report_annotations(
    report_id: int,
    data: AnnotationsUpdate,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.annotations = data.annotations
    db.commit()
    return {"message": "Annotations updated", "annotations": report.annotations}

@router.get("/{report_id}/html")
def get_report_html(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get the HTML version of the report for the In-App Editor.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.html_content:
        return {
            "html_content": report.html_content,
            "original_html_content": report.original_html_content
        }
        
    # Convert from DOCX if HTML not saved yet
    if report.generated_file_path and report.generated_file_path.endswith('.docx') and os.path.exists(report.generated_file_path):
        with open(report.generated_file_path, "rb") as docx_file:
            result = mammoth.convert_to_html(docx_file)
            report.html_content = result.value
            report.original_html_content = result.value
            db.commit()
            return {"html_content": result.value, "original_html_content": result.value}
            
    return {"html_content": "<p>ទិន្នន័យឯកសារមិនអាចទាញយកបានទេ។</p>"}

@router.put("/{report_id}/html")
def update_report_html(
    report_id: int,
    data: HTMLUpdate,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.html_content = data.html_content
    
    # We also need to generate a PDF from this HTML so that the PDF view matches the Editor view!
    pdf_path = report.generated_file_path.replace(".docx", "_edited.pdf").replace(".pdf", "_edited.pdf") if report.generated_file_path else f"generated_reports/report_{report_id}_edited.pdf"
    
    import os
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    font_dir = os.path.abspath(os.path.join("app", "assets", "fonts"))
    
    fonts_to_register = [
        ('Khmer OS Battambang', 'KhmerOSbattambang.ttf'),
        ('Khmer OS Muol Light', 'KhmerOSmuollight.ttf'),
        ('Khmer OS Content', 'KhmerOScontent.ttf'),
        ('Khmer OS Siemreap', 'KhmerOSsiemreap.ttf'),
        ('Khmer OS Bokor', 'KhmerOSbokor.ttf'),
        ('Khmer OS Muol', 'KhmerOSmuol.ttf'),
        ('Khmer OS Sys', 'KhmerOSsys.ttf'),
        ('Khmer OS', 'KhmerOS.ttf')
    ]
    
    for family, filename in fonts_to_register:
        font_file_path = os.path.join(font_dir, filename)
        if os.path.exists(font_file_path):
            try:
                pdfmetrics.registerFont(TTFont(family, font_file_path))
            except Exception as e:
                print(f"Could not register font {family}: {e}")
    
    html_with_style = f"""
    <html>
    <head>
    <style>
        body {{ font-family: 'Khmer OS Battambang', 'Khmer OS', Arial, sans-serif; padding: 20px; }}
        /* Ensure images fit within page */
        img {{ max-width: 100%; height: auto; }}
    </style>
    </head>
    <body>
    {data.html_content}
    </body>
    </html>
    """
    
    from xhtml2pdf import pisa
    with open(pdf_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(html_with_style, dest=pdf_file)
        
    if not pisa_status.err:
        report.generated_file_path = pdf_path
        
    db.commit()
        
    return {"message": "Saved successfully"}


class AssignUser(BaseModel):
    user_id: int

@router.post("/{report_id}/assign_editor")
def assign_editor(
    report_id: int,
    data: AssignUser,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.editor_id = data.user_id
    report.status = "Sent to Editor"
    
    db.add(Approval(report_id=report.id, approver_id=data.user_id, status="Sent to Editor", comments="Assigned to Editor"))
    
    db.commit()
    return {"message": "Assigned editor successfully"}

@router.post("/{report_id}/assign_president")
def assign_president(
    report_id: int,
    data: AssignUser,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.president_id = data.user_id
    report.status = "Sent to President"
    
    db.add(Approval(report_id=report.id, approver_id=data.user_id, status="Sent to President", comments="Assigned to President"))
    
    db.commit()
    return {"message": "Assigned president successfully"}

@router.post("/{report_id}/assign_department_head")
def assign_department_head(
    report_id: int,
    data: AssignUser,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.department_head_id = data.user_id
    report.status = "Sent to Department Head"
    
    db.add(Approval(report_id=report.id, approver_id=data.user_id, status="Sent to Department Head", comments="Assigned to Department Head"))
    
    db.commit()
    return {"message": "Assigned department head successfully"}

@router.post("/{report_id}/assign_admin")
def assign_admin(
    report_id: int,
    data: AssignUser,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.admin_id = data.user_id
    report.status = "Sent to Admin"
    
    db.add(Approval(report_id=report.id, approver_id=data.user_id, status="Sent to Admin", comments="Assigned to Admin"))
    
    db.commit()
    return {"message": "Assigned admin successfully"}

class FinalizeData(BaseModel):
    reference_number: str
    include_qr: bool

import qrcode
from xhtml2pdf import pisa
import uuid

@router.post("/{report_id}/finalize")
def finalize_report(
    report_id: int,
    data: FinalizeData,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.reference_number = data.reference_number
    report.status = "Finalized"
    
    db.add(Approval(report_id=report.id, approver_id=1, status="Finalized", comments=f"Issued Reference Number: {data.reference_number}"))
    
    # Generate QR Code if requested
    qr_img_path = None
    if data.include_qr:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        # The data can be a verification URL
        qr.add_data(f"http://localhost:3000/verify/{report.id}?ref={data.reference_number}")
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        qr_filename = f"qr_{report.id}_{uuid.uuid4().hex[:8]}.png"
        qr_img_path = os.path.join("uploads", qr_filename)
        img.save(qr_img_path)
        report.qr_code_path = qr_img_path

    # Re-generate PDF with reference number and QR code
    if report.html_content:
        # Inject Ref Number
        final_html = f"<div style='text-align:right; font-weight:bold;'>លេខ: {data.reference_number}</div>" + report.html_content
        
        # Inject QR Code at the bottom
        if qr_img_path:
            abs_qr_path = os.path.abspath(qr_img_path)
            final_html += f"<div style='text-align:right; margin-top:50px;'><img src='{abs_qr_path}' width='100' height='100'/></div>"

        pdf_path = f"uploads/final_{report.id}.pdf"
        with open(pdf_path, "w+b") as out_pdf:
            pisa.CreatePDF(final_html, dest=out_pdf)
        
        report.generated_file_path = pdf_path
        
    db.commit()
    return {"message": "Report finalized successfully", "pdf_path": report.generated_file_path}

from fastapi.responses import FileResponse
import os

@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Download the generated DOCX report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not report.generated_file_path:
        raise HTTPException(status_code=404, detail="Report file not found")
        
    if not os.path.exists(report.generated_file_path):
        raise HTTPException(status_code=404, detail="Physical file missing on server")
        
    serve_path = report.generated_file_path
    if serve_path.endswith(".docx"):
        # Convert to PDF so that PdfReviewer can read it
        pdf_path = serve_path.replace(".docx", ".pdf")
        if not os.path.exists(pdf_path):
            from app.services.report_generator import convert_docx_to_pdf
            serve_path = convert_docx_to_pdf(serve_path)
        else:
            serve_path = pdf_path

    is_pdf = serve_path.endswith(".pdf")
    media_type = "application/pdf" if is_pdf else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
    return FileResponse(
        path=serve_path,
        filename=os.path.basename(serve_path),
        media_type=media_type,
        content_disposition_type="inline"
    )

@router.get("/{report_id}/verify")
def verify_report(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Public endpoint for verifying a report via QR Code.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or report.status != "Finalized":
        raise HTTPException(status_code=404, detail="Invalid or Unverified Document")
        
    return {
        "id": report.id,
        "title": report.template.name if report.template else "ឯកសាររដ្ឋបាល",
        "reference_number": report.reference_number,
        "finalized_date": report.created_at, # Or finalized date if you add it
        "creator": report.creator.full_name if report.creator else None,
        "editor": report.editor.full_name if report.editor else None,
        "department_head": report.department_head.full_name if report.department_head else None,
        "admin": report.admin.full_name if report.admin else None,
        "president": report.president.full_name if report.president else None,
    }

@router.get("/{report_id}/tracking")
def get_report_tracking(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get the chronological tracking history of a report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    approvals = db.query(Approval).filter(Approval.report_id == report_id).order_by(Approval.created_at.asc()).all()
    
    tracking = []
    # Add initial creation
    tracking.append({
        "status": "Created",
        "action": "របាយការណ៍ត្រូវបានបង្កើត (Draft)",
        "timestamp": report.created_at,
        "user": report.creator.full_name if report.creator else "អ្នកប្រើប្រាស់",
        "comments": None
    })
    
    for app in approvals:
        tracking.append({
            "status": app.status,
            "action": app.status,
            "timestamp": app.created_at,
            "user": app.approver.full_name if app.approver else "អ្នកប្រើប្រាស់",
            "comments": app.comments
        })
        
    # Also add dispatch info if any
    dispatches = db.query(ExternalDispatch).filter(ExternalDispatch.report_id == report_id).order_by(ExternalDispatch.sent_at.asc()).all()
    for disp in dispatches:
        tracking.append({
            "status": "Dispatched",
            "action": f"បញ្ជូនទៅ {disp.institution_name}",
            "timestamp": disp.sent_at,
            "user": "រដ្ឋបាល/អ្នករត់សំបុត្រ",
            "comments": f"តាម: {disp.dispatch_method}"
        })
        if disp.status == "Received" and disp.received_at:
            tracking.append({
                "status": "Received External",
                "action": f"ស្ថាប័ន {disp.institution_name} បានទទួល",
                "timestamp": disp.received_at,
                "user": "ស្ថាប័នខាងក្រៅ",
                "comments": "បានទទួលឯកសាររួចរាល់"
            })
            
    # Sort again by timestamp just in case
    tracking.sort(key=lambda x: x["timestamp"])
        
    return tracking

from pydantic import BaseModel
from typing import Optional

class DispatchCreate(BaseModel):
    institution_name: str
    dispatch_method: str
    dispatch_photo: Optional[str] = None

@router.post("/{report_id}/dispatch")
def create_dispatch(
    report_id: int,
    data: DispatchCreate,
    db: Session = Depends(deps.get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or report.status != "Finalized":
        raise HTTPException(status_code=400, detail="Report must be finalized to dispatch")
        
    dispatch = ExternalDispatch(
        report_id=report_id,
        institution_name=data.institution_name,
        dispatch_method=data.dispatch_method,
        status="Sent",
        dispatch_photo=data.dispatch_photo
    )
    db.add(dispatch)
    db.commit()
    db.refresh(dispatch)
    return dispatch

@router.get("/{report_id}/dispatches")
def get_dispatches(
    report_id: int,
    db: Session = Depends(deps.get_db)
):
    dispatches = db.query(ExternalDispatch).filter(ExternalDispatch.report_id == report_id).all()
    return dispatches

class ReceiveDispatch(BaseModel):
    receive_photo: Optional[str] = None

@router.put("/dispatches/{dispatch_id}/receive")
def receive_dispatch(
    dispatch_id: int,
    data: ReceiveDispatch,
    db: Session = Depends(deps.get_db)
):
    dispatch = db.query(ExternalDispatch).filter(ExternalDispatch.id == dispatch_id).first()
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
        
    dispatch.status = "Received"
    dispatch.received_at = datetime.utcnow()
    if data.receive_photo:
        dispatch.receive_photo = data.receive_photo
        
    db.commit()
    return {"message": "Marked as received successfully"}
