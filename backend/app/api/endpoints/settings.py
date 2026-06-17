from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.models.setting import Setting

router = APIRouter()

class SettingUpdate(BaseModel):
    value: Any

@router.get("/{key}")
def get_setting(
    key: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a setting by key.
    """
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        return {"key": key, "value": None}
    return {"key": setting.key, "value": setting.value}

@router.post("/{key}")
def set_setting(
    key: str,
    setting_in: SettingUpdate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Create or update a setting by key.
    """
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        setting.value = setting_in.value
    else:
        setting = Setting(key=key, value=setting_in.value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value}
