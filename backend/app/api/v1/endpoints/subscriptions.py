from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.plan import Plan, Subscription, Payment, PlanType, SubscriptionStatus, PaymentStatus
from app.schemas.notification import PlanResponse, SubscriptionCreate, SubscriptionResponse

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Billing"])


@router.get("/plans", response_model=list[PlanResponse])
def list_plans(db: Session = Depends(get_db)):
    return db.query(Plan).filter(Plan.is_active == True).all()


@router.post("/subscribe", response_model=SubscriptionResponse)
def subscribe(
    data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == data.plan_id, Plan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if existing:
        existing.status = SubscriptionStatus.CANCELLED

    now = datetime.utcnow()
    sub = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE,
        starts_at=now,
        expires_at=now + timedelta(days=30),
    )
    db.add(sub)
    db.flush()

    if plan.price > 0:
        payment = Payment(
            subscription_id=sub.id,
            amount=plan.price,
            currency="USD",
            status=PaymentStatus.PENDING,
            invoice_number=f"INV-{sub.id:06d}",
        )
        db.add(payment)

    db.commit()
    db.refresh(sub)
    return sub


@router.get("/my", response_model=SubscriptionResponse)
def my_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    return sub


@router.get("/payment-history")
def payment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payments = db.query(Payment).join(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    return payments


@router.post("/cancel")
def cancel_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    sub.status = SubscriptionStatus.CANCELLED
    db.commit()
    return {"message": "Subscription cancelled"}


# ─── Admin plan management ─────────────────────────────────────────────────────

@router.post("/plans/seed")
def seed_plans(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(Plan).count()
    if existing > 0:
        return {"message": "Plans already seeded"}

    plans = [
        Plan(name="Free", type=PlanType.FREE, price=0, job_posting_limit=3, featured_jobs=0,
             resume_access=False, analytics_access=False, priority_support=False,
             features={"max_jobs": 3, "support": "community"}),
        Plan(name="Premium", type=PlanType.PREMIUM, price=49.99, job_posting_limit=25,
             featured_jobs=5, resume_access=True, analytics_access=True, priority_support=False,
             features={"max_jobs": 25, "featured": 5, "analytics": True}),
        Plan(name="Enterprise", type=PlanType.ENTERPRISE, price=199.99, job_posting_limit=9999,
             featured_jobs=50, resume_access=True, analytics_access=True, priority_support=True,
             features={"max_jobs": "unlimited", "featured": 50, "analytics": True, "support": "priority"}),
    ]
    for p in plans:
        db.add(p)
    db.commit()
    return {"message": "Plans seeded successfully"}
