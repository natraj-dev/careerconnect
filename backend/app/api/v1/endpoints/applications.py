from app.models.resume import Resume
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user, get_current_recruiter
from app.models.user import User
from app.models.application import Application, ApplicationStatus, Interview
from app.models.job import Job
from app.models.company import Recruiter
from app.models.notification import Notification, NotificationType
import os

from fastapi.responses import FileResponse

from app.core.config import settings
from app.models.resume import Resume

from app.models.company import Recruiter

from app.schemas.application import (ApplicationCreate, ApplicationUpdate, ApplicationResponse,
                                     InterviewCreate, InterviewUpdate, InterviewResponse)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse, status_code=201)
def apply_for_job(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == data.job_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Already applied for this job")

    application = Application(user_id=current_user.id, **data.model_dump())
    db.add(application)
    job.applications_count += 1

    recruiters = db.query(Recruiter).filter(
        Recruiter.company_id == job.company_id
    ).all()

    for recruiter in recruiters:
        db.add(
            Notification(
                user_id=recruiter.user_id,
                type=NotificationType.APPLICATION_UPDATE,
                title="New Job Application",
                message=f"{current_user.email} applied for {job.title}"
            )
        )
    db.commit()
    db.refresh(application)
    return application


@router.get("/my", response_model=list[ApplicationResponse])
def my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Application).filter(Application.user_id == current_user.id)\
             .order_by(Application.applied_at.desc()).all()


@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role not in ("RECRUITER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorized")
    return app


@router.put("/{app_id}/withdraw")
def withdraw_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id, Application.user_id == current_user.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = ApplicationStatus.WITHDRAWN
    db.commit()
    return {"message": "Application withdrawn"}


# ─── Recruiter actions ─────────────────────────────────────────────────────────

@router.get("/job/{job_id}/candidates")
def get_job_candidates(
    job_id: int,
    status: ApplicationStatus = None,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.job_id == job_id)
    if status:
        query = query.filter(Application.status == status)
    return query.order_by(Application.applied_at.desc()).all()


@router.put("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(app, k, v)

    notification = Notification(
        user_id=app.user_id,
        title="Application Status Updated",
        message=f"Your application status is now {app.status}"
    )

    db.add(
        Notification(
            user_id=app.user_id,
            type=NotificationType.APPLICATION_UPDATE,
            title="Application Status Updated",
            message=f"Your application status has been changed to {app.status.value}"
        )
    )
    db.commit()
    db.refresh(app)
    return app


# ─── Interviews ────────────────────────────────────────────────────────────────

@router.post("/interviews", response_model=InterviewResponse, status_code=201)
def schedule_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == data.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id).first()
    interview = Interview(
        recruiter_id=recruiter.id if recruiter else None,
        **data.model_dump()
    )
    db.add(interview)
    app.status = ApplicationStatus.INTERVIEW_SCHEDULED

    notification = Notification(
        user_id=app.user_id,
        title="Interview Scheduled",
        message=f"Your interview has been scheduled for application #{app.id}"
    )

    db.add(
        Notification(
            user_id=app.user_id,
            type=NotificationType.INTERVIEW_SCHEDULED,
            title="Interview Scheduled",
            message=f"Interview scheduled on {data.scheduled_at}"
        )
    )
    db.commit()
    db.refresh(interview)
    return interview


@router.put("/interviews/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: int,
    data: InterviewUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(interview, k, v)
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/interviews/my")
def my_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy import join
    interviews = db.query(Interview).join(Application).filter(
        Application.user_id == current_user.id
    ).all()
    return interviews


@router.get("/job/{job_id}/candidates-with-resumes")
def candidates_with_resumes(
    job_id: int,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).all()

    result = []

    for app in applications:
        resume = db.query(Resume).filter(
            Resume.user_id == app.user_id,
            Resume.is_default == True
        ).first()

        result.append({
            "application": app,
            "resume": resume
        })

    return result


@router.get("/download/{resume_id}")
def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404)

    full_path = os.path.join(
        settings.UPLOAD_DIR,
        "resumes",
        os.path.basename(resume.file_path)
    )

    return FileResponse(
        full_path,
        filename=resume.file_name
    )
