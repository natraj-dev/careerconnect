from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os, shutil, uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.resume import UserSkill, Education, Experience
from app.schemas.user import (ProfileCreate, ProfileUpdate, ProfileResponse,
                               SkillCreate, SkillResponse, EducationCreate, EducationResponse,
                               ExperienceCreate, ExperienceResponse)
from app.core.config import settings

router = APIRouter(prefix="/profile", tags=["Profile"])


# ─── Profile ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/", response_model=ProfileResponse, status_code=201)
def create_profile(data: ProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    profile = Profile(user_id=current_user.id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/picture")
async def upload_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP allowed")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "profiles")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(upload_dir, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.profile_picture = f"/uploads/profiles/{filename}"
        db.commit()

    return {"profile_picture": f"/uploads/profiles/{filename}"}


# ─── Skills ────────────────────────────────────────────────────────────────────

@router.get("/skills", response_model=list[SkillResponse])
def get_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()


@router.post("/skills", response_model=SkillResponse, status_code=201)
def add_skill(data: SkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = UserSkill(user_id=current_user.id, **data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.put("/skills/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, data: SkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(skill, k, v)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}


# ─── Education ─────────────────────────────────────────────────────────────────

@router.get("/education", response_model=list[EducationResponse])
def get_education(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Education).filter(Education.user_id == current_user.id).all()


@router.post("/education", response_model=EducationResponse, status_code=201)
def add_education(data: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = Education(user_id=current_user.id, **data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


@router.put("/education/{edu_id}", response_model=EducationResponse)
def update_education(edu_id: int, data: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(edu, k, v)
    db.commit()
    db.refresh(edu)
    return edu


@router.delete("/education/{edu_id}")
def delete_education(edu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"message": "Education deleted"}


# ─── Experience ────────────────────────────────────────────────────────────────

@router.get("/experience", response_model=list[ExperienceResponse])
def get_experience(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Experience).filter(Experience.user_id == current_user.id).all()


@router.post("/experience", response_model=ExperienceResponse, status_code=201)
def add_experience(data: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = Experience(user_id=current_user.id, **data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/experience/{exp_id}", response_model=ExperienceResponse)
def update_experience(exp_id: int, data: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(exp, k, v)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/experience/{exp_id}")
def delete_experience(exp_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience deleted"}
