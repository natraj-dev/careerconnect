from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.notification import NotificationType
from app.models.plan import PlanType, SubscriptionStatus, PaymentStatus


class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    data: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    receiver_id: int
    subject: Optional[str] = None
    content: str
    parent_id: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    subject: Optional[str]
    content: str
    is_read: bool
    parent_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class PlanResponse(BaseModel):
    id: int
    name: str
    type: PlanType
    price: float
    billing_cycle: str
    job_posting_limit: int
    featured_jobs: int
    resume_access: bool
    analytics_access: bool
    priority_support: bool
    features: Optional[dict]
    is_active: bool

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    plan_id: int


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: SubscriptionStatus
    starts_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    company_id: int
    rating: float
    title: Optional[str] = None
    content: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    is_anonymous: bool = False


class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    company_id: Optional[int]
    rating: float
    title: Optional[str]
    content: Optional[str]
    pros: Optional[str]
    cons: Optional[str]
    is_anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True
