from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.models.user import User
from app.models.offer import Offer, OfferItem
from app.models.option import Option
from app.schemas.offer import OfferCreate, OfferUpdate, OfferFilter

def create_offer(db: Session, offer_in: OfferCreate, user_id: int) -> Offer:
    """
    Create a new offer with items
    """
    # Create offer
    offer = Offer(
        user_id=user_id,
        numer=offer_in.numer,
        data=offer_in.data,
        klient=offer_in.klient,
        uwagi=offer_in.uwagi,
        suma_netto=offer_in.suma_netto,
        suma_vat=offer_in.suma_vat,
        suma_brutto=offer_in.suma_brutto
    )
    
    db.add(offer)
    db.flush()  # Flush to get offer ID
    
    # Create offer items
    for item_data in offer_in.items:
        offer_item = OfferItem(
            offer_id=offer.id,
            typ=item_data.typ,
            szerokosc=item_data.szerokosc,
            wysokosc=item_data.wysokosc,
            konfiguracja=item_data.konfiguracja,
            cena_netto=item_data.cena_netto,
            ilosc=item_data.ilosc if hasattr(item_data, 'ilosc') else 1
        )
        db.add(offer_item)
    
    db.commit()
    db.refresh(offer)
    return offer

def get_offer(db: Session, offer_id: int) -> Optional[Offer]:
    """
    Get offer by ID with related items
    """
    return db.query(Offer).filter(Offer.id == offer_id).first()

def get_offers(
    db: Session, 
    user_id: Optional[int] = None,
    filter_params: Optional[OfferFilter] = None
) -> List[Offer]:
    """
    Get offers with filtering
    """
    query = db.query(Offer)
    
    # Filter by user if specified
    if user_id:
        query = query.filter(Offer.user_id == user_id)
    
    # Apply additional filters
    if filter_params:
        if filter_params.search:
            search = f"%{filter_params.search}%"
            query = query.filter(
                or_(
                    Offer.numer.ilike(search),
                    Offer.klient.ilike(search),
                    Offer.uwagi.ilike(search)
                )
            )
        
        if filter_params.date_from:
            query = query.filter(Offer.data >= filter_params.date_from)
        
        if filter_params.date_to:
            query = query.filter(Offer.data <= filter_params.date_to)
        
        # Apply sorting
        if filter_params.sort_by:
            sort_column = getattr(Offer, filter_params.sort_by, Offer.data)
            if filter_params.sort_direction == 'asc':
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
        else:
            # Default sorting by date descending
            query = query.order_by(desc(Offer.data))
    else:
        # Default sorting by date descending
        query = query.order_by(desc(Offer.data))
    
    return query.all()

def update_offer(db: Session, offer: Offer, offer_in: OfferUpdate) -> Offer:
    """
    Update offer with items
    """
    # Update offer fields
    update_data = offer_in.dict(exclude_unset=True, exclude={"items"})
    for field, value in update_data.items():
        setattr(offer, field, value)
    
    # Update items if provided
    if offer_in.items is not None:
        # Delete existing items
        db.query(OfferItem).filter(OfferItem.offer_id == offer.id).delete()
        
        # Create new items
        for item_data in offer_in.items:
            offer_item = OfferItem(
                offer_id=offer.id,
                typ=item_data.typ,
                szerokosc=item_data.szerokosc,
                wysokosc=item_data.wysokosc,
                konfiguracja=item_data.konfiguracja,
                cena_netto=item_data.cena_netto,
                ilosc=item_data.ilosc if hasattr(item_data, 'ilosc') else 1
            )
            db.add(offer_item)
    
    db.commit()
    db.refresh(offer)
    return offer

def delete_offer(db: Session, offer_id: int) -> None:
    """
    Delete offer and related items
    """
    try:
        # Get the offer first
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return
            
        # Delete all offer items first
        db.query(OfferItem).filter(OfferItem.offer_id == offer_id).delete(synchronize_session='fetch')
        
        # Then delete the offer
        db.query(Offer).filter(Offer.id == offer_id).delete(synchronize_session='fetch')
        
        # Commit the transaction
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

def is_offer_owner_or_admin(offer: Offer, user: User) -> bool:
    """
    Check if user is offer owner or admin
    """
    return user.role == "admin" or offer.user_id == user.id

def check_offer_exists(db: Session, offer_id: int) -> Offer:
    """
    Check if offer exists and return it
    """
    offer = get_offer(db, offer_id)
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    return offer

def get_options_by_ids(db: Session, option_ids: List[str]) -> Dict[str, Option]:
    """
    Get options by IDs and return as a dictionary
    """
    options = db.query(Option).filter(Option.id_opcji.in_(option_ids)).all()
    return {option.id_opcji: option for option in options}
