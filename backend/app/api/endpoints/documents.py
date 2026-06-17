from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter()

@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    db: Session = Depends(deps.get_db),
    type: str = None
) -> Any:
    """
    Retrieve documents.
    """
    query = db.query(Document)
    if type:
        query = query.filter(Document.type == type)
    documents = query.order_by(Document.created_at.desc()).all()
    return documents

@router.post("/", response_model=DocumentResponse)
def create_document(
    *,
    db: Session = Depends(deps.get_db),
    doc_in: DocumentCreate
) -> Any:
    """
    Create new document.
    """
    document = Document(
        type=doc_in.type,
        reference_number=doc_in.reference_number,
        title=doc_in.title,
        document_date=doc_in.document_date,
        institution=doc_in.institution,
        file_path=doc_in.file_path,
        status=doc_in.status,
        notes=doc_in.notes
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.put("/{id}", response_model=DocumentResponse)
def update_document(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    doc_in: DocumentUpdate
) -> Any:
    """
    Update a document.
    """
    document = db.query(Document).filter(Document.id == id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    update_data = doc_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
        
    db.commit()
    db.refresh(document)
    return document

@router.delete("/{id}")
def delete_document(
    *,
    db: Session = Depends(deps.get_db),
    id: int
) -> Any:
    """
    Delete a document.
    """
    document = db.query(Document).filter(Document.id == id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}
