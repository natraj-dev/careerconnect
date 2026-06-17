from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, profile, resume, jobs, applications, companies,
    notifications, admin, ai_assistant, subscriptions, reviews, payments
)
from app.api.v1.endpoints.notifications import notifications_router, messages_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(resume.router)
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
api_router.include_router(companies.router)
api_router.include_router(notifications_router)
api_router.include_router(messages_router)
api_router.include_router(admin.router)
api_router.include_router(ai_assistant.router)
api_router.include_router(subscriptions.router)
api_router.include_router(reviews.router)
api_router.include_router(payments.router)
