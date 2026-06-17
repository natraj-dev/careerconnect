"""
Seed script: creates demo users, categories, companies, and sample jobs.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.job import JobCategory, Job, JobType, JobStatus, ExperienceLevel
from app.models.company import Company, Recruiter
from app.models.plan import Plan, PlanType
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import re

def slugify(text: str) -> str:
    return re.sub(r'[\s-]+', '-', re.sub(r'[^a-z0-9\s-]', '', text.lower())).strip('-')

def seed():
    print("Creating tables...")
    create_tables()
    db = SessionLocal()

    try:
        # ── Plans ──────────────────────────────────────────────────────────────
        if db.query(Plan).count() == 0:
            print("Seeding plans...")
            for p in [
                Plan(name="Free", type=PlanType.FREE, price=0, job_posting_limit=3,
                     featured_jobs=0, resume_access=False, analytics_access=False,
                     priority_support=False, features={"max_jobs": 3}),
                Plan(name="Premium", type=PlanType.PREMIUM, price=49.99, job_posting_limit=25,
                     featured_jobs=5, resume_access=True, analytics_access=True,
                     priority_support=False, features={"max_jobs": 25, "featured": 5}),
                Plan(name="Enterprise", type=PlanType.ENTERPRISE, price=199.99, job_posting_limit=9999,
                     featured_jobs=50, resume_access=True, analytics_access=True,
                     priority_support=True, features={"max_jobs": "unlimited"}),
            ]:
                db.add(p)
            db.commit()

        # ── Admin user ─────────────────────────────────────────────────────────
        if not db.query(User).filter(User.email == "admin@demo.com").first():
            print("Creating admin user...")
            admin = User(email="admin@demo.com", hashed_password=get_password_hash("admin123"),
                        role=UserRole.ADMIN, is_active=True, is_verified=True)
            db.add(admin); db.flush()
            db.add(Profile(user_id=admin.id, first_name="Admin", last_name="User"))
            db.commit()

        # ── Recruiter user ─────────────────────────────────────────────────────
        rec_user = db.query(User).filter(User.email == "recruiter@demo.com").first()
        if not rec_user:
            print("Creating recruiter user...")
            rec_user = User(email="recruiter@demo.com", hashed_password=get_password_hash("recruiter123"),
                           role=UserRole.RECRUITER, is_active=True, is_verified=True)
            db.add(rec_user); db.flush()
            db.add(Profile(user_id=rec_user.id, first_name="Demo", last_name="Recruiter",
                          headline="Senior HR Manager", city="San Francisco", country="US"))
            db.commit()

        # ── Job seeker user ────────────────────────────────────────────────────
        if not db.query(User).filter(User.email == "seeker@demo.com").first():
            print("Creating job seeker user...")
            seeker = User(email="seeker@demo.com", hashed_password=get_password_hash("seeker123"),
                         role=UserRole.JOB_SEEKER, is_active=True, is_verified=True)
            db.add(seeker); db.flush()
            db.add(Profile(user_id=seeker.id, first_name="Jane", last_name="Doe",
                          headline="Full Stack Developer", bio="Passionate software engineer with 5 years of experience.",
                          city="New York", country="US", years_of_experience=5))
            db.commit()

        # ── Company ────────────────────────────────────────────────────────────
        company = db.query(Company).filter(Company.name == "TechCorp Inc.").first()
        if not company:
            print("Creating demo company...")
            company = Company(
                name="TechCorp Inc.", slug="techcorp-inc",
                description="A leading technology company building next-generation software solutions. We believe in empowering developers and creating products that matter.",
                website="https://techcorp.example.com", industry="Technology",
                company_size="51-200", founded_year=2015,
                headquarters="San Francisco, CA", is_verified=True, is_active=True
            )
            db.add(company); db.flush()

            # Link recruiter
            if not db.query(Recruiter).filter(Recruiter.user_id == rec_user.id).first():
                rec = Recruiter(user_id=rec_user.id, company_id=company.id,
                               designation="HR Manager", department="Human Resources", is_verified=True)
                db.add(rec)
            db.commit()
            db.refresh(company)

        recruiter_rec = db.query(Recruiter).filter(Recruiter.user_id == rec_user.id).first()

        # ── Job Categories ─────────────────────────────────────────────────────
        categories_data = [
            ("Technology", "💻"), ("Marketing", "📈"), ("Finance", "💰"),
            ("Healthcare", "🏥"), ("Design", "🎨"), ("Sales", "🤝"),
            ("Engineering", "⚙️"), ("Education", "📚"), ("Data Science", "📊"),
            ("Customer Service", "💬"),
        ]
        cat_map = {}
        for name, icon in categories_data:
            cat = db.query(JobCategory).filter(JobCategory.name == name).first()
            if not cat:
                cat = JobCategory(name=name, slug=slugify(name), icon=icon, is_active=True)
                db.add(cat)
            cat_map[name] = cat
        db.commit()
        for name in cat_map:
            db.refresh(cat_map[name])

        # ── Sample Jobs ────────────────────────────────────────────────────────
        if db.query(Job).count() == 0:
            print("Creating sample jobs...")
            jobs_data = [
                {
                    "title": "Senior React Developer",
                    "description": "We are looking for an experienced React Developer to join our dynamic team. You will be responsible for building high-quality web applications and collaborating with our product and design teams.\n\nThis is a great opportunity to work on exciting products used by millions of people worldwide.",
                    "requirements": "• 4+ years of React.js experience\n• Strong TypeScript skills\n• Experience with Redux/Zustand\n• Familiarity with REST APIs\n• Good understanding of CSS/Tailwind\n• Experience with testing frameworks (Jest, Cypress)",
                    "responsibilities": "• Build and maintain React applications\n• Collaborate with UX/UI designers\n• Write clean, maintainable code\n• Participate in code reviews\n• Mentor junior developers",
                    "benefits": "• Competitive salary\n• Health insurance\n• Remote-friendly\n• Stock options\n• 30 days PTO",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.SENIOR,
                    "location": "San Francisco, CA",
                    "city": "San Francisco",
                    "country": "US",
                    "is_remote": True,
                    "salary_min": 130000,
                    "salary_max": 170000,
                    "required_skills": ["React", "TypeScript", "Redux", "Node.js"],
                    "category": "Technology",
                    "openings": 2,
                    "is_featured": True,
                },
                {
                    "title": "Product Manager",
                    "description": "Join our product team as a Product Manager and help shape the future of our platform. You will work closely with engineering, design, and business stakeholders.",
                    "requirements": "• 3+ years of product management experience\n• Strong analytical skills\n• Experience with Agile methodologies\n• Excellent communication skills\n• Data-driven decision making",
                    "responsibilities": "• Define product roadmap and strategy\n• Work with engineering teams\n• Conduct user research\n• Write product specifications\n• Track key metrics",
                    "benefits": "• Competitive compensation\n• Equity package\n• Remote work option\n• Learning budget",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.MID,
                    "location": "New York, NY",
                    "city": "New York",
                    "country": "US",
                    "is_remote": False,
                    "salary_min": 110000,
                    "salary_max": 145000,
                    "required_skills": ["Product Management", "Agile", "Roadmapping", "Analytics"],
                    "category": "Technology",
                    "openings": 1,
                    "is_featured": True,
                },
                {
                    "title": "Data Scientist",
                    "description": "We are seeking a talented Data Scientist to analyze large datasets and build predictive models that drive business decisions.",
                    "requirements": "• MS/PhD in Statistics, Math, or CS\n• 2+ years Python/R experience\n• Machine learning frameworks (TensorFlow, PyTorch)\n• SQL proficiency\n• Data visualization skills",
                    "responsibilities": "• Build and deploy ML models\n• Analyze data patterns\n• Create dashboards\n• Present insights to stakeholders",
                    "benefits": "• Top-of-market salary\n• Full remote\n• Conference budget\n• Stock options",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.MID,
                    "location": "Austin, TX",
                    "city": "Austin",
                    "country": "US",
                    "is_remote": True,
                    "salary_min": 120000,
                    "salary_max": 160000,
                    "required_skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
                    "category": "Data Science",
                    "openings": 2,
                    "is_featured": False,
                },
                {
                    "title": "UX/UI Designer",
                    "description": "Create beautiful, intuitive interfaces for our web and mobile products. You will be collaborating with product managers and developers.",
                    "requirements": "• 3+ years UI/UX experience\n• Proficiency in Figma\n• Strong portfolio\n• Understanding of design systems\n• User research skills",
                    "responsibilities": "• Design wireframes and prototypes\n• Conduct usability testing\n• Maintain design system\n• Collaborate with developers",
                    "benefits": "• Creative environment\n• Remote work\n• Design tools budget",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.MID,
                    "location": "Los Angeles, CA",
                    "city": "Los Angeles",
                    "country": "US",
                    "is_remote": True,
                    "salary_min": 95000,
                    "salary_max": 130000,
                    "required_skills": ["Figma", "Adobe XD", "Prototyping", "User Research"],
                    "category": "Design",
                    "openings": 1,
                    "is_featured": False,
                },
                {
                    "title": "DevOps Engineer",
                    "description": "Help us build and maintain our cloud infrastructure. You will automate deployments, monitor systems, and ensure high availability.",
                    "requirements": "• 3+ years DevOps/SRE experience\n• AWS/GCP/Azure expertise\n• Kubernetes and Docker\n• CI/CD pipelines\n• Infrastructure as Code (Terraform)",
                    "responsibilities": "• Manage cloud infrastructure\n• Build CI/CD pipelines\n• Monitor system performance\n• Incident response",
                    "benefits": "• Fully remote\n• Competitive pay\n• AWS certification reimbursement",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.SENIOR,
                    "location": "Remote",
                    "city": "",
                    "country": "US",
                    "is_remote": True,
                    "salary_min": 125000,
                    "salary_max": 155000,
                    "required_skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
                    "category": "Engineering",
                    "openings": 1,
                    "is_featured": True,
                },
                {
                    "title": "Marketing Manager",
                    "description": "Drive growth through strategic marketing initiatives. Own the marketing funnel from awareness to conversion.",
                    "requirements": "• 4+ years marketing experience\n• B2B SaaS experience preferred\n• Data-driven mindset\n• Experience with HubSpot/Salesforce",
                    "responsibilities": "• Define marketing strategy\n• Manage campaigns\n• Content creation\n• Analyze campaign performance",
                    "benefits": "• Performance bonuses\n• Flexible hours\n• Remote option",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.MID,
                    "location": "Chicago, IL",
                    "city": "Chicago",
                    "country": "US",
                    "is_remote": False,
                    "salary_min": 85000,
                    "salary_max": 115000,
                    "required_skills": ["Digital Marketing", "SEO", "HubSpot", "Analytics", "Content Marketing"],
                    "category": "Marketing",
                    "openings": 1,
                    "is_featured": False,
                },
                {
                    "title": "Backend Python Developer",
                    "description": "Build scalable APIs and microservices using Python and FastAPI. Join a team of passionate engineers.",
                    "requirements": "• 3+ years Python experience\n• FastAPI or Django REST Framework\n• PostgreSQL/MySQL\n• Redis, Celery\n• Docker",
                    "responsibilities": "• Design and build REST APIs\n• Database optimization\n• Write unit tests\n• Code reviews",
                    "benefits": "• Remote first\n• Flexible PTO\n• Health & dental",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.MID,
                    "location": "Seattle, WA",
                    "city": "Seattle",
                    "country": "US",
                    "is_remote": True,
                    "salary_min": 115000,
                    "salary_max": 150000,
                    "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
                    "category": "Technology",
                    "openings": 2,
                    "is_featured": False,
                },
                {
                    "title": "Financial Analyst",
                    "description": "Support strategic financial decisions with detailed analysis, modeling, and reporting.",
                    "requirements": "• BS in Finance, Accounting or Economics\n• 2+ years FP&A experience\n• Advanced Excel\n• CFA preferred",
                    "responsibilities": "• Financial modeling\n• Budget forecasting\n• Monthly reporting\n• Variance analysis",
                    "benefits": "• Competitive salary\n• 401k matching\n• Annual bonus",
                    "job_type": JobType.FULL_TIME,
                    "experience_level": ExperienceLevel.JUNIOR,
                    "location": "Boston, MA",
                    "city": "Boston",
                    "country": "US",
                    "is_remote": False,
                    "salary_min": 75000,
                    "salary_max": 100000,
                    "required_skills": ["Financial Modeling", "Excel", "SQL", "Python", "PowerBI"],
                    "category": "Finance",
                    "openings": 1,
                    "is_featured": False,
                },
            ]

            for jd in jobs_data:
                cat = cat_map.get(jd.pop("category"))
                j = Job(
                    company_id=company.id,
                    recruiter_id=recruiter_rec.id if recruiter_rec else None,
                    category_id=cat.id if cat else None,
                    status=JobStatus.PUBLISHED,
                    **jd
                )
                db.add(j)
                db.flush()
                j.slug = slugify(j.title) + f"-{j.id}"
            db.commit()
            print(f"Created {len(jobs_data)} sample jobs.")

        print("\n✅ Seed complete!")
        print("=" * 40)
        print("Demo accounts:")
        print("  Admin:     admin@demo.com     / admin123")
        print("  Recruiter: recruiter@demo.com / recruiter123")
        print("  Seeker:    seeker@demo.com    / seeker123")
        print("=" * 40)

    except Exception as e:
        print(f"❌ Seed failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
