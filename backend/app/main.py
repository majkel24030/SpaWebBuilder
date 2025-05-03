import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.database import engine, Base
from app.utils.init_db import init_db, init_admin_user
from app.api.deps import get_db

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Windoor Config System",
    description="API for window and door configuration system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, specify domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    try:
        # Initialize database with options from CSV
        init_db(db)
        # Create initial admin user if not exists
        init_admin_user(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Windoor Config System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
