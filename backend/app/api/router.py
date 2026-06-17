from fastapi import APIRouter
from app.api.endpoints import auth, users, reports, ai, archive, templates, settings, documents, visit_requests

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(archive.router, prefix="/archive", tags=["archive"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(visit_requests.router, prefix="/visit-requests", tags=["visit_requests"])
