from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional
import re

from app.db.database import get_db
from app.core.security import get_current_user, get_current_recruiter
from app.models.user import User
from app.models.job import Job, JobCategory, JobType, JobStatus, ExperienceLevel
from app.models.application import SavedJob
from app.models.company import Recruiter
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobCategoryCreate, JobCategoryResponse, JobListResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def make_slug(title: str, job_id: int) -> str:
    slug = re.sub(r"[^a-z0-9\s-]", "", title.lower())
    slug = re.sub(r"[\s-]+", "-", slug).strip("-")
    return f"{slug}-{job_id}"


# ─── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[JobCategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(JobCategory).filter(JobCategory.is_active == True).all()


@router.post("/categories", response_model=JobCategoryResponse, status_code=201)
def create_category(
    data: JobCategoryCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    slug = re.sub(r"[^a-z0-9\s-]", "", data.name.lower()).replace(" ", "-")
    cat = JobCategory(name=data.name, slug=slug,
                      description=data.description, icon=data.icon)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ─── Jobs CRUD ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=JobListResponse)
def list_jobs(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[JobType] = Query(None),
    experience_level: Optional[ExperienceLevel] = Query(None),
    category_id: Optional[int] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    is_remote: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == JobStatus.PUBLISHED)

    if keyword:
        query = query.filter(or_(
            Job.title.ilike(f"%{keyword}%"),
            Job.description.ilike(f"%{keyword}%"),
        ))
    if location:
        query = query.filter(or_(
            Job.location.ilike(f"%{location}%"),
            Job.city.ilike(f"%{location}%"),
            Job.country.ilike(f"%{location}%"),
        ))
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if category_id:
        query = query.filter(Job.category_id == category_id)
    if salary_min:
        query = query.filter(Job.salary_max >= salary_min)
    if salary_max:
        query = query.filter(Job.salary_min <= salary_max)
    if is_remote is not None:
        query = query.filter(Job.is_remote == is_remote)
    if is_featured is not None:
        query = query.filter(Job.is_featured == is_featured)

    total = query.count()
    jobs = query.order_by(Job.is_featured.desc(), Job.created_at.desc())\
                .offset((page - 1) * page_size).limit(page_size).all()

    return JobListResponse(
        total=total,
        page=page,
        page_size=page_size,
        jobs=[JobResponse.model_validate(job) for job in jobs]
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.views_count += 1
    db.commit()
    return job


@router.post("/", response_model=JobResponse, status_code=201)
def create_job(
    data: JobCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id).first()
    job = Job(
        recruiter_id=recruiter.id if recruiter else None,
        company_id=recruiter.company_id if recruiter else None,
        **data.model_dump()
    )
    db.add(job)
    db.flush()
    job.slug = make_slug(job.title, job.id)
    db.commit()
    db.refresh(job)
    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role != "ADMIN" and (not recruiter or job.recruiter_id != recruiter.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id).first()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role != "ADMIN" and (not recruiter or job.recruiter_id != recruiter.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


@router.post("/{job_id}/publish")
def publish_job(
    job_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.PUBLISHED
    db.commit()
    return {"message": "Job published"}


# ─── Saved Jobs ────────────────────────────────────────────────────────────────

@router.post("/{job_id}/save")
def save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id, SavedJob.job_id == job_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Job unsaved", "saved": False}

    saved = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"message": "Job saved", "saved": True}


@router.get("/saved/list")
def get_saved_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id).all()
    return saved


# ─── Recommendations ───────────────────────────────────────────────────────────

@router.get("/recommended/list")
def get_recommended_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.resume import UserSkill
    skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id).all()
    skill_names = [s.name.lower() for s in skills]

    jobs = db.query(Job).filter(Job.status == JobStatus.PUBLISHED).order_by(
        Job.created_at.desc()).limit(20).all()

    if skill_names:
        scored = []
        for job in jobs:
            score = 0
            req = (job.required_skills or [])
            for sk in req:
                if sk.lower() in skill_names:
                    score += 1
            scored.append((score, job))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [j for _, j in scored[:10]]

    return jobs[:10]
