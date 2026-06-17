from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os, shutil, uuid, re

from app.db.database import get_db
from app.core.security import get_current_user, get_current_recruiter, get_current_admin
from app.models.user import User
from app.models.company import Company, Recruiter
from app.schemas.application import CompanyCreate, CompanyUpdate, CompanyResponse, RecruiterCreate, RecruiterResponse
from app.core.config import settings

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/", response_model=list[CompanyResponse])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).filter(Company.is_active == True).all()


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("/", response_model=CompanyResponse, status_code=201)
def create_company(
    data: CompanyCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    slug = re.sub(r"[^a-z0-9\s-]", "", data.name.lower()).replace(" ", "-")
    company = Company(slug=slug, **data.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    data: CompanyUpdate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(company, k, v)
    db.commit()
    db.refresh(company)
    return company


@router.post("/{company_id}/logo")
async def upload_logo(
    company_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "logos")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    with open(os.path.join(upload_dir, filename), "wb") as f:
        shutil.copyfileobj(file.file, f)

    company.logo = f"/uploads/logos/{filename}"
    db.commit()
    return {"logo": company.logo}


# ─── Recruiter Profile ─────────────────────────────────────────────────────────

@router.get("/recruiters/me", response_model=RecruiterResponse)
def get_my_recruiter_profile(current_user: User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    rec = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    return rec


@router.post("/recruiters", response_model=RecruiterResponse, status_code=201)
def create_recruiter_profile(
    data: RecruiterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Recruiter profile already exists")
    rec = Recruiter(user_id=current_user.id, **data.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/recruiters/me", response_model=RecruiterResponse)
def update_recruiter_profile(
    data: RecruiterCreate,
    current_user: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    rec = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(rec, k, v)
    db.commit()
    db.refresh(rec)
    return rec
