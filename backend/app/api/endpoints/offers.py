from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from datetime import date

from app.api.deps import get_db, get_current_user, get_current_admin
from app.models.user import User
from app.models.offer import Offer, OfferItem
from app.schemas.offer import (
    Offer as OfferSchema,
    OfferCreate,
    OfferUpdate,
    OfferFilter
)
from app.services.offer import (
    create_offer,
    get_offer,
    get_offers,
    update_offer,
    delete_offer,
    is_offer_owner_or_admin,
    check_offer_exists
)
from app.services.pdf import generate_offer_pdf

router = APIRouter()

@router.post("/", response_model=OfferSchema)
def create_offer_endpoint(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new offer
    """
    offer = create_offer(db=db, offer_in=offer_in, user_id=current_user.id)
    return offer

@router.get("/", response_model=List[OfferSchema])
def read_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    sort_by: Optional[str] = None,
    sort_direction: Optional[str] = None
) -> Any:
    """
    Retrieve offers
    """
    # Create filter from query parameters
    filter_params = OfferFilter(
        search=search,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by,
        sort_direction=sort_direction
    )
    
    # If user is admin, get all offers, otherwise only user's offers
    if current_user.role == "admin":
        offers = get_offers(db, filter_params=filter_params)
    else:
        offers = get_offers(db, user_id=current_user.id, filter_params=filter_params)
    
    return offers

@router.get("/{offer_id}", response_model=OfferSchema)
def read_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get offer by ID
    """
    offer = get_offer(db, offer_id=offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Check if user is offer owner or admin
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return offer

@router.put("/{offer_id}", response_model=OfferSchema)
def update_offer_endpoint(
    offer_id: int,
    offer_in: OfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update offer
    """
    offer = check_offer_exists(db, offer_id)
    
    # Check if user is offer owner or admin
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    offer = update_offer(db=db, offer=offer, offer_in=offer_in)
    return offer

@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_offer_endpoint(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete offer
    """
    offer = check_offer_exists(db, offer_id)
    
    # Check if user is offer owner or admin
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    delete_offer(db=db, offer_id=offer_id)

@router.get("/{offer_id}/pdf", response_class=Response)
def generate_pdf(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Generate PDF for offer
    """
    offer = check_offer_exists(db, offer_id)
    
    # Check if user is offer owner or admin
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate PDF
    pdf_content = generate_offer_pdf(db, offer)
    
    # Return PDF - usuwamy header Content-Disposition: attachment, aby plik był otwierany w przeglądarce
    # zamiast automatycznie pobierany
    headers = {
        'Content-Disposition': f'inline; filename="Oferta_{offer.numer.replace("/", "_")}.pdf"'
    }
    return Response(content=pdf_content, media_type="application/pdf", headers=headers)
