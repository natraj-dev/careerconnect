from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.job import JobType, JobStatus, ExperienceLevel


class JobCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class JobCategoryResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str]
    description: Optional[str]
    icon: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    category_id: Optional[int] = None
    job_type: JobType
    experience_level: Optional[ExperienceLevel] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    required_skills: Optional[List[str]] = None
    openings: int = 1
    expires_at: Optional[datetime] = None


class JobUpdate(JobCreate):
    title: Optional[str] = None
    description: Optional[str] = None
    job_type: Optional[JobType] = None
    status: Optional[JobStatus] = None


class JobResponse(BaseModel):
    id: int
    title: str
    slug: Optional[str]
    description: str
    requirements: Optional[str]
    responsibilities: Optional[str]
    benefits: Optional[str]
    job_type: JobType
    experience_level: Optional[ExperienceLevel]
    status: JobStatus
    location: Optional[str]
    city: Optional[str]
    country: Optional[str]
    is_remote: bool
    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_currency: str
    required_skills: Optional[List[str]]
    openings: int
    applications_count: int
    views_count: int
    is_featured: bool
    expires_at: Optional[datetime]
    created_at: datetime
    category_id: Optional[int]
    company_id: Optional[int]
    recruiter_id: Optional[int]

    class Config:
        from_attributes = True


class JobSearchParams(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    category_id: Optional[int] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_remote: Optional[bool] = None
    is_featured: Optional[bool] = None
    page: int = 1
    page_size: int = 20


class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    jobs: List[JobResponse]
