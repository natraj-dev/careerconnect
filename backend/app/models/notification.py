from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class NotificationType(str, enum.Enum):
    JOB_ALERT = "JOB_ALERT"
    APPLICATION_UPDATE = "APPLICATION_UPDATE"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    INTERVIEW_REMINDER = "INTERVIEW_REMINDER"
    MESSAGE = "MESSAGE"
    SYSTEM = "SYSTEM"
    PROFILE_VIEW = "PROFILE_VIEW"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text, nullable=True)  # JSON string for extra data
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    subject = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    replies = relationship("Message", foreign_keys=[parent_id])
