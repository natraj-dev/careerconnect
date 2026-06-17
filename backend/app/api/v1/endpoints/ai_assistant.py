from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import UserSkill, Education, Experience
from app.models.profile import Profile

router = APIRouter(prefix="/ai", tags=["AI Career Assistant"])


class AIRequest(BaseModel):
    message: str
    context: Optional[str] = None


def generate_demo_response(message: str, profile, skills):
    msg = message.lower()

    skills_text = ", ".join([s.name for s in skills]
                            ) if skills else "No skills listed"

    if "resume" in msg:
        return f"""
Resume Improvement Suggestions:

• Add measurable achievements to every project.
• Highlight your strongest technical skills.
• Include GitHub and LinkedIn profile links.
• Showcase FastAPI, React, SQL, and Python projects.
• Use action verbs such as Developed, Implemented, Optimized, and Designed.

Current Skills:
{skills_text}
"""

    elif "interview" in msg:
        return f"""
Interview Preparation Tips:

• Review Python fundamentals and OOP concepts.
• Practice SQL queries and database design questions.
• Prepare FastAPI and REST API concepts.
• Be ready to explain your projects in detail.
• Practice behavioral questions using the STAR method.

Common Questions:
1. Explain FastAPI.
2. What is JWT Authentication?
3. Difference between SQL and NoSQL?
4. Explain OOP concepts in Python.
5. Describe a challenging project you completed.
"""

    elif "skill" in msg:
        return f"""
Skill Gap Analysis:

Current Skills:
{skills_text}

Recommended Next Skills:
• Docker
• PostgreSQL
• Redis
• AWS Basics
• CI/CD Pipelines
• Unit Testing with Pytest
• System Design Fundamentals

These skills will significantly improve your employability as a Python Developer.
"""

    elif "career" in msg or "job" in msg:
        return f"""
Career Guidance:

Suggested Career Path:

Python Developer
↓
Backend Developer
↓
Full Stack Developer
↓
Senior Software Engineer
↓
Tech Lead

Focus Areas:
• Python
• FastAPI
• SQL
• React
• Git & GitHub
• Cloud Technologies

Build at least 3-5 strong portfolio projects and keep your GitHub active.
"""

    else:
        return f"""
CareerConnect AI Assistant

Based on your profile, here are some recommendations:

• Continue improving Python programming skills.
• Build more real-world projects.
• Learn FastAPI and React thoroughly.
• Practice SQL and database optimization.
• Strengthen problem-solving abilities.
• Prepare for technical interviews regularly.

Current Skills:
{skills_text}

Question Received:
{message}
"""


@router.post("/career-assistant")
async def career_assistant(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id
    ).all()

    return {
        "response": generate_demo_response(
            request.message,
            profile,
            skills
        ),
        "type": "success"
    }


@router.post("/resume-suggestions")
async def resume_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id
    ).all()

    return {
        "response": generate_demo_response(
            "resume review",
            profile,
            skills
        ),
        "type": "success"
    }


@router.post("/interview-prep/{job_id}")
async def interview_prep(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.job import Job

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "response": f"""
Interview Preparation for: {job.title}

Technical Areas:
• Python Fundamentals
• FastAPI
• REST APIs
• SQL Queries
• Database Design
• Git & GitHub

Job Requirements:
{job.requirements or 'Not specified'}

Preparation Tips:
• Study the required skills.
• Review your related projects.
• Practice coding problems.
• Prepare examples of teamwork and problem-solving.
• Research the company and role.
""",
        "type": "success"
    }
