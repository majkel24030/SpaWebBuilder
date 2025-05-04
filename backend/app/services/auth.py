from datetime import datetime, timedelta
from typing import Optional, Union

from fastapi import HTTPException, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import ALGORITHM
from app.config import settings

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    
    # Print debugging information
    print(f"Creating token with data: {to_encode}")
    print(f"Using SECRET_KEY: {settings.SECRET_KEY[:5]}...")
    print(f"Using ALGORITHM: {ALGORITHM}")
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    print(f"Generated token: {encoded_jwt[:10]}...")
    return encoded_jwt

def verify_token(token: str) -> Union[str, int]:
    """
    Verify JWT token and return user_id
    """
    try:
        # Print debugging information
        print(f"Decoding token: {token[:10]}...")
        print(f"Using SECRET_KEY: {settings.SECRET_KEY[:5]}...")
        print(f"Using ALGORITHM: {ALGORITHM}")
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token - missing subject"
            )
        return int(user_id)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
