from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.application import ApplicationStatus, InterviewType, InterviewStatus
from app.models.company import CompanySize


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    recruiter_notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int]
    status: ApplicationStatus
    cover_letter: Optional[str]
    notes: Optional[str]
    recruiter_notes: Optional[str]
    applied_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class InterviewCreate(BaseModel):
    application_id: int
    interview_type: InterviewType
    scheduled_at: datetime
    duration_minutes: int = 60
    location: Optional[str] = None
    video_link: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    status: Optional[InterviewStatus] = None
    scheduled_at: Optional[datetime] = None
    video_link: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    rating: Optional[int] = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    recruiter_id: Optional[int]
    interview_type: InterviewType
    status: InterviewStatus
    scheduled_at: datetime
    duration_minutes: int
    location: Optional[str]
    video_link: Optional[str]
    notes: Optional[str]
    feedback: Optional[str]
    rating: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[CompanySize] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    linkedin_url: Optional[str] = None


class CompanyUpdate(CompanyCreate):
    name: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str]
    description: Optional[str]
    website: Optional[str]
    logo: Optional[str]
    industry: Optional[str]
    company_size: Optional[CompanySize]
    founded_year: Optional[int]
    headquarters: Optional[str]
    linkedin_url: Optional[str]
    is_verified: bool
    is_active: bool

    class Config:
        from_attributes = True


class RecruiterCreate(BaseModel):
    company_id: Optional[int] = None
    designation: Optional[str] = None
    department: Optional[str] = None


class RecruiterResponse(BaseModel):
    id: int
    user_id: int
    company_id: Optional[int]
    designation: Optional[str]
    department: Optional[str]
    is_verified: bool
    is_active: bool

    class Config:
        from_attributes = True
