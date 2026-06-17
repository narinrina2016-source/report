import os
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from docxtpl import DocxTemplate

from app.api import deps
from app.models.template import Template

router = APIRouter()

UPLOAD_DIR = "uploaded_templates"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
def upload_template(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form("General"),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Upload a new DOCX or PDF template.
    """
    if not file.filename.lower().endswith(('.docx', '.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only .docx, .pdf, and image files are supported")
        
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{name.replace(' ', '_')}_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    extracted_fields = {}
    if file_path.lower().endswith('.docx'):
        try:
            doc = DocxTemplate(file_path)
            variables = doc.get_undeclared_template_variables()
            for var in variables:
                extracted_fields[var] = "text"
        except Exception as e:
            print(f"Error extracting variables from {file_path}: {e}")

    # Insert record into database
    template = Template(
        name=name,
        category=category,
        file_path=file_path,
        fields=extracted_fields
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {
        "message": "Template uploaded successfully",
        "template_id": template.id,
        "file_name": safe_filename,
        "fields": template.fields
    }

@router.get("/")
def list_templates(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all templates.
    """
    templates = db.query(Template).offset(skip).limit(limit).all()
    return [{"id": t.id, "name": t.name, "category": t.category, "file_path": t.file_path, "fields": t.fields} for t in templates]

from pydantic import BaseModel
class TemplateUpdate(BaseModel):
    name: str
    category: str
    fields: dict

@router.put("/{id}")
def update_template(
    id: int,
    template_in: TemplateUpdate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Update template fields.
    """
    template = db.query(Template).filter(Template.id == id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    template.name = template_in.name
    template.category = template_in.category
    template.fields = template_in.fields
    db.commit()
    db.refresh(template)
    return {"id": template.id, "name": template.name, "category": template.category, "file_path": template.file_path, "fields": template.fields}

@router.post("/")
def create_template(
    template_in: TemplateUpdate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Create a new template without a file.
    """
    template = Template(
        name=template_in.name,
        category=template_in.category,
        fields=template_in.fields,
        file_path=""
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return {"id": template.id, "name": template.name, "category": template.category, "file_path": template.file_path, "fields": template.fields}
