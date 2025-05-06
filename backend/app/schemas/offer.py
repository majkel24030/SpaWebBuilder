from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date

class OfferItemBase(BaseModel):
    typ: str = Field(..., description="Product type ID")
    szerokosc: int = Field(..., ge=400, le=3000, description="Width in millimeters")
    wysokosc: int = Field(..., ge=400, le=3000, description="Height in millimeters")
    konfiguracja: Dict[str, str] = Field(default_factory=dict, description="Configuration options by category")
    cena_netto: float = Field(..., ge=0, description="Net price")
    ilosc: Optional[int] = Field(None, ge=1, description="Quantity of windows of this type")

class OfferItemCreate(OfferItemBase):
    pass

class OfferItemUpdate(BaseModel):
    typ: Optional[str] = None
    szerokosc: Optional[int] = None
    wysokosc: Optional[int] = None
    konfiguracja: Optional[Dict[str, str]] = None
    cena_netto: Optional[float] = None
    ilosc: Optional[int] = None

class OfferItemInDB(OfferItemBase):
    id: int
    offer_id: int
    
    class Config:
        orm_mode = True

class OfferItem(OfferItemInDB):
    pass

class OfferBase(BaseModel):
    numer: str = Field(..., description="Offer number")
    data: date = Field(..., description="Offer date")
    klient: str = Field(..., min_length=3, description="Customer name")
    uwagi: Optional[str] = Field(None, description="Notes")
    suma_netto: float = Field(..., ge=0, description="Total net price")
    suma_vat: float = Field(..., ge=0, description="Total VAT")
    suma_brutto: float = Field(..., ge=0, description="Total gross price")

class OfferCreate(OfferBase):
    items: List[OfferItemCreate] = Field(..., min_items=1, description="Offer items")

class OfferUpdate(BaseModel):
    numer: Optional[str] = None
    data: Optional[date] = None
    klient: Optional[str] = None
    uwagi: Optional[str] = None
    suma_netto: Optional[float] = None
    suma_vat: Optional[float] = None
    suma_brutto: Optional[float] = None
    items: Optional[List[OfferItemCreate]] = None

class OfferInDB(OfferBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True

class Offer(OfferInDB):
    items: List[OfferItem] = []

# Query parameters for filtering offers
class OfferFilter(BaseModel):
    search: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_direction: Optional[str] = Field(None, description="Sort direction (asc/desc)")
