from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.review import Review
from app.schemas.notification import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = Review(reviewer_id=current_user.id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/company/{company_id}", response_model=list[ReviewResponse])
def get_company_reviews(company_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(
        Review.company_id == company_id, Review.is_approved == True
    ).order_by(Review.created_at.desc()).all()


@router.get("/company/{company_id}/rating")
def get_company_rating(company_id: int, db: Session = Depends(get_db)):
    result = db.query(func.avg(Review.rating), func.count(Review.id)).filter(
        Review.company_id == company_id, Review.is_approved == True
    ).first()
    return {"average_rating": round(result[0] or 0, 1), "total_reviews": result[1]}
