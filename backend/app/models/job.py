from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class JobType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"
    FREELANCE = "FREELANCE"
    REMOTE = "REMOTE"


class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"


class ExperienceLevel(str, enum.Enum):
    ENTRY = "ENTRY"
    JUNIOR = "JUNIOR"
    MID = "MID"
    SENIOR = "SENIOR"
    LEAD = "LEAD"
    EXECUTIVE = "EXECUTIVE"


class JobCategory(Base):
    __tablename__ = "job_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("Job", back_populates="category")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("job_categories.id"), nullable=True)
    job_type = Column(Enum(JobType), nullable=False)
    experience_level = Column(Enum(ExperienceLevel), nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.DRAFT)
    location = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    is_remote = Column(Boolean, default=False)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="USD")
    required_skills = Column(JSON, nullable=True)
    openings = Column(Integer, default=1)
    applications_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="jobs")
    recruiter = relationship("Recruiter", back_populates="jobs")
    category = relationship("JobCategory", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
    saved_by = relationship("SavedJob", back_populates="job")
