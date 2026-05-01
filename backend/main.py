from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_router, resume_router, analytics_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(resume_router.router)
app.include_router(analytics_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Analyzer API"}
