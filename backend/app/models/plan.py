from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class PlanType(str, enum.Enum):
    FREE = "FREE"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
    PENDING = "PENDING"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum(PlanType), nullable=False)
    price = Column(Float, default=0.0)
    billing_cycle = Column(String(50), default="MONTHLY")

    job_posting_limit = Column(Integer, default=5)
    featured_jobs = Column(Integer, default=0)

    resume_access = Column(Boolean, default=False)
    analytics_access = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)

    features = Column(JSON, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    subscriptions = relationship(
        "Subscription",
        back_populates="plan"
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    subscription_id = Column(Integer, ForeignKey("subscriptions.id"))

    amount = Column(Float, nullable=False)

    currency = Column(String(10), default="INR")

    status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.PENDING
    )

    invoice_number = Column(String(100), nullable=True)

    invoice_url = Column(String(500), nullable=True)

    # Cashfree fields
    cashfree_order_id = Column(String(255), nullable=True)
    cashfree_payment_id = Column(String(255), nullable=True)

    paid_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    subscription = relationship(
        "Subscription",
        back_populates="payments"
    )


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(
        "users.id", ondelete="CASCADE"), unique=True)
    plan_id = Column(Integer, ForeignKey("plans.id"))
    status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.PENDING
    )
    starts_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")
