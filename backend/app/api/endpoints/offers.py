from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from app.services.auth import verify_token

# Dodaj security scheme aby opcjonalnie przyjmować Authorization Bearer token
oauth2_bearer = HTTPBearer(auto_error=False)

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
    request: Request,  # Używamy obiektu Request by uzyskać dostęp do nagłówków
    token: Optional[str] = Query(None),  # Dodajemy opcjonalny token w parametrze zapytania
    db: Session = Depends(get_db),
) -> Any:
    """
    Generate PDF for offer - obsługuje autentykację zarówno z nagłówka jak i parametru URL
    """
    import logging
    from app.services.auth import verify_token
    
    # Dodajemy szczegółowe logowanie
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("pdf_endpoint")
    
    # Pobierz nagłówek autoryzacji z obiektu request
    authorization = request.headers.get("Authorization")
    
    logger.info(f"PDF endpoint called with offer_id={offer_id}, token present: {token is not None}, authorization header present: {authorization is not None}")
    
    # Spróbuj autentykacji z różnych źródeł
    user_id = None
    user = None
    
    # 1. Spróbuj z parametru tokena URL
    if token:
        logger.info(f"Trying to authenticate with token from URL parameter")
        try:
            user_id = verify_token(token)
            logger.info(f"Token from URL verified, user_id: {user_id}")
        except Exception as e:
            logger.warning(f"URL token verification failed: {str(e)}")
            # Nie rzucaj wyjątku tutaj, bo może nadal być nagłówek authorization
    
    # 2. Spróbuj z nagłówka autoryzacji, jeśli token URL nie zadziałał
    if user_id is None and authorization:
        logger.info(f"Trying to authenticate with Authorization header")
        try:
            auth_parts = authorization.split()
            if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                header_token = auth_parts[1]
                user_id = verify_token(header_token)
                logger.info(f"Token from header verified, user_id: {user_id}")
        except Exception as e:
            logger.warning(f"Authorization header verification failed: {str(e)}")
    
    # Znajdź użytkownika na podstawie ID
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        logger.info(f"User found: {user.email if user else 'None'}")
    
    # Sprawdź, czy autentykacja się powiodła
    if not user:
        logger.error("Authentication failed: No user found from any authentication method")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Pobierz ofertę
    logger.info(f"Looking for offer with ID: {offer_id}")
    try:
        offer = check_offer_exists(db, offer_id)
        logger.info(f"Offer found: {offer.numer}, owner_id: {offer.user_id}")
    except Exception as e:
        logger.error(f"Error finding offer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer not found: {str(e)}"
        )
    
    # Check if user is offer owner or admin
    if not is_offer_owner_or_admin(offer, user):
        logger.error(f"Permission denied: User {user.id} not owner of offer by user {offer.user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Generate PDF
    logger.info("Generating PDF content")
    try:
        pdf_content = generate_offer_pdf(db, offer)
        logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )
    
    # Return PDF - ustawiamy header Content-Disposition: attachment, aby plik był pobierany
    # zamiast wyświetlany w przeglądarce (to zawsze działa, nawet jeśli mogą być problemy z inline)
    logger.info("Returning PDF response")
    headers = {
        'Content-Disposition': f'attachment; filename="Oferta_{offer.numer.replace("/", "_")}.pdf"',
        'Content-Type': 'application/pdf'
    }
    return Response(content=pdf_content, media_type="application/pdf", headers=headers)