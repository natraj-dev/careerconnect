from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import requests
import uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.core.config import settings

from app.models.user import User
from app.models.plan import (
    Plan,
    Subscription,
    Payment,
    SubscriptionStatus,
    PaymentStatus
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/create-order")
def create_order(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.is_active == True
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found"
        )

    order_id = f"CC_{uuid.uuid4().hex[:12]}"

    headers = {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
    }

    payload = {
        "order_id": order_id,
        "order_amount": float(plan.price),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": str(current_user.id),
            "customer_email": current_user.email,
            "customer_phone": "9999999999"
        }
    }

    response = requests.post(
        f"{settings.CASHFREE_BASE_URL}/orders",
        json=payload,
        headers=headers
    )

    if response.status_code not in [200, 201]:
        raise HTTPException(
            status_code=400,
            detail=response.text
        )

    data = response.json()

    subscription = Subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        status=SubscriptionStatus.PENDING,
        starts_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30)
    )

    db.add(subscription)
    db.flush()

    payment = Payment(
        subscription_id=subscription.id,
        amount=plan.price,
        status=PaymentStatus.PENDING,
        cashfree_order_id=order_id,
        invoice_number=f"INV-{subscription.id:06d}"
    )

    db.add(payment)

    db.commit()

    return {
        "order_id": order_id,
        "payment_session_id": data["payment_session_id"]
    }


@router.post("/webhook")
async def cashfree_webhook(
    payload: dict,
    db: Session = Depends(get_db)
):

    order_id = payload.get("data", {}).get("order", {}).get("order_id")

    payment_status = payload.get(
        "data",
        {}
    ).get(
        "payment",
        {}
    ).get(
        "payment_status"
    )

    payment = db.query(Payment).filter(
        Payment.cashfree_order_id == order_id
    ).first()

    if not payment:
        return {"message": "order not found"}

    if payment_status == "SUCCESS":

        payment.status = PaymentStatus.SUCCESS

        payment.cashfree_payment_id = (
            payload["data"]["payment"]["cf_payment_id"]
        )

        payment.paid_at = datetime.utcnow()

        subscription = payment.subscription

        subscription.status = SubscriptionStatus.ACTIVE

        db.commit()

    return {"message": "ok"}
