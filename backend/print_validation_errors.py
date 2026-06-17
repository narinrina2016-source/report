from app.core.database import SessionLocal
from app.models.visit_request import VisitRequest
from app.schemas.visit_request import VisitRequestResponse
import traceback

db = SessionLocal()
try:
    requests = db.query(VisitRequest).all()
    for r in requests:
        try:
            VisitRequestResponse.model_validate(r)
        except Exception as e:
            print(f"Error validating VisitRequest ID {r.id}: {e}")
except Exception as e:
    print(f"DB Error: {e}")
finally:
    db.close()
