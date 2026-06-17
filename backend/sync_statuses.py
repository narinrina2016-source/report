from app.core.database import SessionLocal
from app.models.visit_request import VisitRequest
from app.models.document import Document

db = SessionLocal()
try:
    requests = db.query(VisitRequest).all()
    updated = 0
    for req in requests:
        doc_ref = req.letter_number or f"VR-{req.tracking_token[:8].upper()}"
        doc = db.query(Document).filter(Document.reference_number == doc_ref).first()
        if doc and doc.status != req.status:
            print(f"Updating document {doc.reference_number} from {doc.status} to {req.status}")
            doc.status = req.status
            updated += 1
            
    if updated > 0:
        db.commit()
        print(f"Successfully synced {updated} documents.")
    else:
        print("All documents are already in sync.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
