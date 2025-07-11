from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db, get_current_user, get_current_admin
from backend.app.models.user import User
from backend.app.models.option import Option
from backend.app.schemas.option import (
    Option as OptionSchema,
    OptionCreate,
    OptionUpdate
)

router = APIRouter()

@router.get("/", response_model=List[OptionSchema])
def read_options(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve options, optionally filtered by category
    """
    query = db.query(Option)
    
    if category:
        query = query.filter(Option.kategoria == category)
    
    options = query.all()
    return options

@router.get("/categories", response_model=List[str])
def read_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve all option categories
    """
    categories = db.query(Option.kategoria).distinct().all()
    return [category[0] for category in categories]

@router.get("/category/{category}", response_model=List[OptionSchema])
def read_options_by_category(
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve options filtered by category
    """
    options = db.query(Option).filter(Option.kategoria == category).all()
    return options

@router.post("/", response_model=OptionSchema)
def create_option(
    option_in: OptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # Only admin can create options
) -> Any:
    """
    Create a new option
    """
    # Check if option with this ID already exists
    option = db.query(Option).filter(Option.id_opcji == option_in.id_opcji).first()
    if option:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Option with this ID already exists"
        )
    
    option = Option(
        id_opcji=option_in.id_opcji,
        kategoria=option_in.kategoria,
        nazwa=option_in.nazwa,
        cena_netto_eur=option_in.cena_netto_eur
    )
    db.add(option)
    db.commit()
    db.refresh(option)
    return option

@router.get("/{option_id}", response_model=OptionSchema)
def read_option(
    option_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get option by ID
    """
    option = db.query(Option).filter(Option.id_opcji == option_id).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    return option

@router.put("/{option_id}", response_model=OptionSchema)
def update_option(
    option_id: str,
    option_in: OptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # Only admin can update options
) -> Any:
    """
    Update option
    """
    option = db.query(Option).filter(Option.id_opcji == option_id).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    
    update_data = option_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(option, field, value)
    
    db.commit()
    db.refresh(option)
    return option

@router.delete("/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_option(
    option_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # Only admin can delete options
) -> None:
    """
    Delete option
    """
    option = db.query(Option).filter(Option.id_opcji == option_id).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    
    db.delete(option)
    db.commit()
