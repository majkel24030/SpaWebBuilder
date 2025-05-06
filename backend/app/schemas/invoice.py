from typing import Dict, List, Optional, Any
from datetime import date
from pydantic import BaseModel, Field, EmailStr

class InvoiceClientInfo(BaseModel):
    """Schema for client information on an invoice"""
    name: str = Field(..., description="Client name/company name")
    address: str = Field(..., description="Client's address")
    nip: Optional[str] = Field(None, description="NIP (tax ID) if applicable")
    phone: Optional[str] = Field(None, description="Client's phone number")
    email: Optional[EmailStr] = Field(None, description="Client's email address")

class InvoiceItemBase(BaseModel):
    """Base schema for an invoice item"""
    type: str = Field(..., description="Product type")
    width: int = Field(..., description="Width in millimeters")
    height: int = Field(..., description="Height in millimeters")
    quantity: int = Field(..., ge=1, description="Quantity")
    unit_price: float = Field(..., ge=0, description="Unit price (net)")
    options: Dict[str, str] = Field(..., description="Product options by category")

class InvoiceItem(InvoiceItemBase):
    """Schema for an invoice item with computed values"""
    net_amount: float = Field(..., description="Net amount (unit_price * quantity)")
    gross_amount: float = Field(..., description="Gross amount (net_amount + VAT)")

class InvoiceCreate(BaseModel):
    """Schema for creating a new invoice"""
    offer_id: int = Field(..., description="Related offer ID")
    number: Optional[str] = Field(None, description="Invoice number (generated if not provided)")
    issue_date: date = Field(..., description="Issue date")
    due_date: date = Field(..., description="Payment due date")
    payment_method: str = Field("przelew bankowy", description="Payment method")
    client: InvoiceClientInfo
    notes: Optional[str] = Field(None, description="Additional notes")
    vat_rate: float = Field(0.23, description="VAT rate (default 23%)")
    currency: str = Field("EUR", description="Currency")

class Invoice(InvoiceCreate):
    """Schema for a complete invoice with computed values"""
    id: int
    items: List[InvoiceItem]
    net_total: float = Field(..., description="Total net amount")
    vat_amount: float = Field(..., description="Total VAT amount")
    gross_total: float = Field(..., description="Total gross amount")

    class Config:
        from_attributes = True  # Renamed from orm_mode in Pydantic v2