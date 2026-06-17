from sqlalchemy.orm import Session
from typing import Optional


def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    details: Optional[str] = None
):
    try:
        from app.models.review import AuditLog
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            details=details,
        )
        db.add(log)
        db.commit()
    except Exception:
        pass  # Don't fail on audit log errors
