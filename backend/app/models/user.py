from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # "admin" or "user"
    is_active = Column(Boolean, default=True)

    # Relationships
    offers = relationship("Offer", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
