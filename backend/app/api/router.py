from fastapi import APIRouter

from app.api.endpoints import auth, offers, options, users

api_router = APIRouter()

# Include all endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(options.router, prefix="/options", tags=["options"])
