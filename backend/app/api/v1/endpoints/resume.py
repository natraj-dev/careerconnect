from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os, shutil, uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.core.config import settings

router = APIRouter(prefix="/resumes", tags=["Resume Management"])


@router.get("/")
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == current_user.id).all()


@router.post("/upload", status_code=201)
async def upload_resume(
    title: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed = {"application/pdf", "application/msword",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF/DOC/DOCX allowed")

    size = 0
    content = await file.read()
    size = len(content)
    if size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)

    with open(path, "wb") as f:
        f.write(content)

    # Set as default if first resume
    existing_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    is_default = existing_count == 0

    resume = Resume(
        user_id=current_user.id,
        title=title,
        file_path=f"/uploads/resumes/{filename}",
        file_name=file.filename,
        file_size=size,
        is_default=is_default,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}")
def delete_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    full_path = os.path.join(settings.UPLOAD_DIR, resume.file_path.lstrip("/uploads/"))
    if os.path.exists(full_path):
        os.remove(full_path)

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}


@router.post("/{resume_id}/set-default")
def set_default_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_default": False})
    resume.is_default = True
    db.commit()
    return {"message": "Default resume updated"}
