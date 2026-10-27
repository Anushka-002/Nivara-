import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.seed_data import seed_database
from backend.app.api import patient, guardian, doctor, simulation

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("Initializing Nivara application...")
    seed_database()
    yield
    # Shutdown actions
    print("Shutting down Nivara...")

app = FastAPI(
    title="Nivara Healthcare API",
    description="AI-Powered Independent Living & Safety Companion for Alzheimer's / MCI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(patient.router)
app.include_router(guardian.router)
app.include_router(doctor.router)
app.include_router(simulation.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Nivara Independent Living Companion",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "disclaimer": "Assistive monitoring only. Not a diagnostic tool."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
