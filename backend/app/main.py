import os
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Setup API routes normally
app.include_router(api_router, prefix="/api")

# Configure static files
# Use absolute path for production or relative path for development
frontend_build_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

# Check if frontend build exists
if os.path.isdir(frontend_build_path):
    print(f"Frontend build found at: {frontend_build_path}")
    # Mount static assets for direct access
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_path, "assets")), name="static_assets")

    # Create a catch-all route for the frontend that doesn't conflict with API or docs
    # This route will only be hit if no other routes match
    @app.get("/", include_in_schema=False)
    async def serve_frontend_root():
        return FileResponse(os.path.join(frontend_build_path, "index.html"))
        
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str, request: Request):
        # Exclude all /api/ paths - they should be handled by the API router
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail=f"API endpoint {full_path} not found")
            
        # Exclude docs and openapi.json
        if full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail=f"Endpoint /{full_path} not found")
            
        # For all other routes, serve the frontend
        index_path = os.path.join(frontend_build_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            return {"error": f"Frontend file not found at {index_path}"}
else:
    print(f"Frontend build NOT found at: {frontend_build_path}")
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Windoor Config System API. Frontend build not found."}

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

if __name__ == "__main__":
    import uvicorn
    import sys
    
    # Check for command line arguments
    port = 8080  # Default port for Replit
    if "--port" in sys.argv:
        try:
            port_index = sys.argv.index("--port") + 1
            port = int(sys.argv[port_index])
        except (ValueError, IndexError):
            pass
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
