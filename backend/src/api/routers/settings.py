"""
Router de configuración del sistema (settings).
GET público para todos los autenticados, PUT solo admin.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import admin_required, get_current_user
from src.models.db_models import SystemSetting
from src.models.schemas import SettingsMap, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsMap)
async def get_settings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all system settings as a flat object."""
    result = await db.execute(select(SystemSetting))
    rows = result.scalars().all()
    data = {row.key: row.value for row in rows}
    return SettingsMap(**data)


@router.put("", response_model=SettingsMap)
async def update_settings(
    body: SettingsUpdate,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    """Update one or more system settings (admin only)."""
    for key, value in body.settings.items():
        result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
        else:
            db.add(SystemSetting(key=key, value=value))

    await db.commit()

    # Return updated settings
    result = await db.execute(select(SystemSetting))
    rows = result.scalars().all()
    data = {row.key: row.value for row in rows}
    return SettingsMap(**data)
