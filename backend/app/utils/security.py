from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Algorithm used for JWT
ALGORITHM = "HS256"

# JWT token utilities are provided in app/services/auth.py
