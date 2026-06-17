from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any

from app.api import deps
from app.services.ai_service import generate_executive_summary, generate_narrative, translate_text, enhance_text

router = APIRouter()

class SummaryRequest(BaseModel):
    report_data: Dict[str, Any]

class NarrativeRequest(BaseModel):
    current_value: float
    previous_value: float
    metric_name: str
    language: str = "Khmer"

class TranslateRequest(BaseModel):
    text: str
    target_language: str

@router.post("/summary")
def get_executive_summary(
    request: SummaryRequest,
    current_user = Depends(deps.get_current_active_user)
):
    summary = generate_executive_summary(request.report_data)
    return {"summary": summary}

@router.post("/narrative")
def get_narrative(
    request: NarrativeRequest,
    current_user = Depends(deps.get_current_active_user)
):
    narrative = generate_narrative(
        request.current_value, 
        request.previous_value, 
        request.metric_name, 
        request.language
    )
    return {"narrative": narrative}

@router.post("/translate")
def translate(
    request: TranslateRequest,
    current_user = Depends(deps.get_current_active_user)
):
    translated_text = translate_text(request.text, request.target_language)
    return {"translated_text": translated_text}

class EnhanceRequest(BaseModel):
    text: str

@router.post("/enhance")
def enhance_content(request: EnhanceRequest):
    """
    Enhance short informal text into formal administrative Khmer language.
    """
    enhanced = enhance_text(request.text)
    return {"enhanced_text": enhanced}

