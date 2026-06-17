from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import date, datetime


class ProfileCreate(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: Optional[int] = 0
    current_salary: Optional[int] = None
    expected_salary: Optional[int] = None
    notice_period: Optional[str] = None
    job_type_preference: Optional[str] = None


class ProfileUpdate(ProfileCreate):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    bio: Optional[str]
    headline: Optional[str]
    location: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    profile_picture: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    years_of_experience: int
    current_salary: Optional[int]
    expected_salary: Optional[int]
    notice_period: Optional[str]
    job_type_preference: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    name: str
    proficiency: Optional[str] = None
    years_of_experience: Optional[int] = 0
    category_id: Optional[int] = None


class SkillResponse(BaseModel):
    id: int
    name: str
    proficiency: Optional[str]
    years_of_experience: int
    category_id: Optional[int]

    class Config:
        from_attributes = True


class EducationCreate(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    grade: Optional[str] = None
    description: Optional[str] = None


class EducationResponse(EducationCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ExperienceCreate(BaseModel):
    company_name: str
    job_title: str
    employment_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None


class ExperienceResponse(ExperienceCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
