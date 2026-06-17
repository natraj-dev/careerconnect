from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.db.database import get_db
from app.core.security import get_current_admin
from app.models.user import User, UserRole
from app.models.company import Company, Recruiter
from app.models.job import Job, JobStatus
from app.models.application import Application
from app.models.review import AuditLog
from app.models.plan import Subscription, Payment

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    stats = {
        "total_users": db.query(User).count(),
        "total_job_seekers": db.query(User).filter(User.role == UserRole.JOB_SEEKER).count(),
        "total_recruiters": db.query(User).filter(User.role == UserRole.RECRUITER).count(),
        "total_companies": db.query(Company).count(),
        "total_jobs": db.query(Job).count(),
        "published_jobs": db.query(Job).filter(Job.status == JobStatus.PUBLISHED).count(),
        "total_applications": db.query(Application).count(),
        "verified_companies": db.query(Company).filter(Company.is_verified == True).count(),
        "total_revenue": db.query(func.sum(Payment.amount)).scalar() or 0,
    }
    return stats


@router.get("/users")
def list_users(
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    total = query.count()
    users = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "users": users}


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.put("/companies/{company_id}/verify")
def verify_company(company_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_verified = True
    db.commit()
    return {"message": "Company verified"}


@router.put("/recruiters/{recruiter_id}/verify")
def verify_recruiter(recruiter_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    recruiter = db.query(Recruiter).filter(
        Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    recruiter.is_verified = True
    db.commit()
    return {"message": "Recruiter verified"}


@router.put("/jobs/{job_id}/feature")
def toggle_featured_job(job_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_featured = not job.is_featured
    db.commit()
    return {"message": f"Job {'featured' if job.is_featured else 'unfeatured'}"}


@router.get("/analytics")
def get_analytics(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta
    from sqlalchemy import extract, func

    now = datetime.utcnow()

    # User growth for last 6 months
    months = []
    for i in range(6):
        month = now - timedelta(days=30 * i)

        count = db.query(User).filter(
            extract("year", User.created_at) == month.year,
            extract("month", User.created_at) == month.month
        ).count()

        months.append({
            "month": month.strftime("%b %Y"),
            "users": count
        })

    # Top job categories
    category_rows = (
        db.query(
            Job.category_id,
            func.count(Job.id).label("count")
        )
        .group_by(Job.category_id)
        .order_by(func.count(Job.id).desc())
        .limit(5)
        .all()
    )

    top_categories = [
        {
            "category_id": row.category_id,
            "count": row.count
        }
        for row in category_rows
    ]

    return {
        "user_growth": months[::-1],
        "top_job_categories": top_categories,
        "application_stats": {
            "total": db.query(Application).count(),
            "this_month": db.query(Application)
            .filter(
                Application.applied_at >= now - timedelta(days=30)
            )
            .count()
        }
    }


@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total = db.query(AuditLog).count()
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc())\
             .offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "logs": logs}
