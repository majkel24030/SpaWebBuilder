from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, get_current_user, get_current_admin
from backend.app.models.user import User
from backend.app.schemas.user import (
    User as UserSchema,
    UserUpdate,
    UserStatusUpdate,
    UserUpdatePassword
)
from backend.app.services.auth import get_password_hash, verify_password

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user
    """
    return current_user

@router.patch("/me", response_model=UserSchema)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update current user
    """
    # Filter to only allow updating certain fields
    update_data = user_in.dict(exclude_unset=True, exclude={"role", "is_active"})
    
    # Check if email is being updated and if it's already used
    if "email" in update_data and update_data["email"] != current_user.email:
        user = db.query(User).filter(User.email == update_data["email"]).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_user_password(
    password_in: UserUpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Update current user password
    """
    # Verify current password
    if not verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update to new password
    current_user.hashed_password = get_password_hash(password_in.new_password)
    db.commit()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  # Only admin can list users
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  # Only admin can get other users
) -> Any:
    """
    Get user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  # Only admin can update users
) -> Any:
    """
    Update user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_in.dict(exclude_unset=True)
    
    # Check if email is being updated and if it's already used
    if "email" in update_data and update_data["email"] != user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/status", response_model=UserSchema)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  # Only admin can update user status
) -> Any:
    """
    Update user active status
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deactivating the last active admin
    if user.role == "admin" and user.is_active and not status_in.is_active:
        # Count active admins
        active_admins = db.query(User).filter(
            User.role == "admin",
            User.is_active == True
        ).count()
        
        if active_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the last active admin"
            )
    
    user.is_active = status_in.is_active
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  # Only admin can delete users
) -> None:
    """
    Delete user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user account"
        )
    
    # Prevent deleting the last active admin
    if user.role == "admin" and user.is_active:
        # Count active admins
        active_admins = db.query(User).filter(
            User.role == "admin",
            User.is_active == True
        ).count()
        
        if active_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last active admin"
            )
    
    db.delete(user)
    db.commit()
