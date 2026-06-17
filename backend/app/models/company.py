from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class CompanySize(str, enum.Enum):
    STARTUP = "1-10"
    SMALL = "11-50"
    MEDIUM = "51-200"
    LARGE = "201-1000"
    ENTERPRISE = "1000+"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    logo = Column(String(500), nullable=True)
    industry = Column(String(255), nullable=True)
    company_size = Column(Enum(CompanySize), nullable=True)
    founded_year = Column(Integer, nullable=True)
    headquarters = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    recruiters = relationship("Recruiter", back_populates="company")
    jobs = relationship("Job", back_populates="company")
    reviews = relationship("Review", back_populates="company")


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    designation = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiters")
    jobs = relationship("Job", back_populates="recruiter")
    interviews = relationship("Interview", back_populates="recruiter")
