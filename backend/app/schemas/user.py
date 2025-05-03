from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=3)
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_strength(cls, v):
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def password_strength(cls, v):
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        return v

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserInDB(UserBase):
    id: int
    role: str
    
    class Config:
        orm_mode = True

class User(UserInDB):
    pass
