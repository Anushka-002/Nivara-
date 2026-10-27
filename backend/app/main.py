import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.database import engine, Base
from backend.app.seed_data import seed_database
from backend.app.api import patient, guardian, doctor, simulation, ai_endpoints

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
app.include_router(ai_endpoints.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Nivara Independent Living Companion",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "disclaimer": "Assistive monitoring only. Not a diagnostic tool."
    }

# Mount static files from frontend/dist if built (for Docker / Hugging Face Spaces deployment)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow API routes to pass through
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
