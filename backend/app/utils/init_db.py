from sqlalchemy.orm import Session
import os
from backend.app.models.user import User
from backend.app.utils.csv_loader import load_options_from_csv
from backend.app.services.auth import get_password_hash
from backend.app.config import settings

def init_db(db: Session) -> None:
    """
    Initialize database with options from CSV
    """
    # Load options from CSV if file exists
    from backend.app.models.option import Option
    
    # Check if options already exist
    if db.query(Option).count() == 0:
        # Load options from CSV
        csv_file_path = settings.CSV_FILE_PATH
        if os.path.exists(csv_file_path):
            load_options_from_csv(db, csv_file_path)
            print(f"Options loaded from {csv_file_path}")
        else:
            print(f"CSV file not found at {csv_file_path}")

def init_admin_user(db: Session) -> None:
    """
    Create initial admin user if not exists
    """
    # Check if admin user already exists
    admin = db.query(User).filter(User.role == "admin").first()
    
    if not admin:
        # Create admin user
        admin = User(
            email="admin@example.com",
            full_name="Administrator",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created")
