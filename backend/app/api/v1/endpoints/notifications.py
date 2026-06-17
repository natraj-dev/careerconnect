from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.notification import Notification, Message, NotificationType
from app.schemas.notification import NotificationResponse, MessageCreate, MessageResponse


router = APIRouter(tags=["Communication"])

notifications_router = APIRouter(prefix="/notifications")
messages_router = APIRouter(prefix="/messages")


@notifications_router.get("/", response_model=list[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == current_user.id)\
             .order_by(Notification.created_at.desc()).limit(50).all()


@notifications_router.put("/{notif_id}/read")
def mark_read(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@notifications_router.put("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@notifications_router.get("/unread-count")
def unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).count()
    return {"count": count}


# ─── Messages ──────────────────────────────────────────────────────────────────

@messages_router.post("/", response_model=MessageResponse, status_code=201)
def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = Message(sender_id=current_user.id, **data.model_dump())
    db.add(msg)

    db.add(
        Notification(
            user_id=data.receiver_id,
            type=NotificationType.MESSAGE,
            title="New Message",
            message=f"You received a message from {current_user.email}"
        )
    )
    db.commit()
    db.refresh(msg)
    return msg


@messages_router.get("/inbox", response_model=list[MessageResponse])
def get_inbox(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Message).filter(
        Message.receiver_id == current_user.id, Message.parent_id == None
    ).order_by(Message.created_at.desc()).all()


@messages_router.get("/sent", response_model=list[MessageResponse])
def get_sent(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Message).filter(
        Message.sender_id == current_user.id, Message.parent_id == None
    ).order_by(Message.created_at.desc()).all()


@messages_router.get("/conversation/{user_id}", response_model=list[MessageResponse])
def get_conversation(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import or_, and_
    msgs = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id,
                 Message.receiver_id == user_id),
            and_(Message.sender_id == user_id,
                 Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()
    return msgs


@messages_router.put("/{msg_id}/read")
def mark_message_read(msg_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(
        Message.id == msg_id, Message.receiver_id == current_user.id
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return {"message": "Marked as read"}
