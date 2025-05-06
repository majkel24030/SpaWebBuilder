from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.offer import Offer
from app.models.invoice import Invoice, InvoiceItem
from app.models.option import Option
from app.schemas.invoice import InvoiceCreate, InvoiceClientInfo

def generate_invoice_number() -> str:
    """Generate invoice number based on current date and time"""
    now = datetime.now()
    return f"FV/{now.year}/{now.month:02d}/{now.day:02d}/{now.hour:02d}{now.minute:02d}{now.second:02d}"

def create_invoice_from_offer(db: Session, offer_id: int, client_info: InvoiceClientInfo, 
                              issue_date: Optional[date] = None, 
                              payment_term_days: int = 14) -> Invoice:
    """
    Create invoice from offer
    """
    # Get offer with items
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise ValueError(f"Offer with ID {offer_id} not found")
    
    # Set dates
    if issue_date is None:
        issue_date = date.today()
    due_date = issue_date + timedelta(days=payment_term_days)
    
    # Create invoice
    invoice = Invoice(
        offer_id=offer.id,
        number=generate_invoice_number(),
        issue_date=issue_date,
        due_date=due_date,
        client_info=client_info.dict(),
        net_total=offer.suma_netto,
        vat_amount=offer.suma_vat,
        gross_total=offer.suma_brutto
    )
    
    db.add(invoice)
    db.flush()  # To get invoice ID
    
    # Create invoice items from offer items
    for offer_item in offer.items:
        # Get option names
        option_names = {}
        for category, option_id in offer_item.konfiguracja.items():
            option = db.query(Option).filter(Option.id_opcji == option_id).first()
            if option:
                option_names[category] = option.nazwa
        
        # Calculate item amounts
        quantity = offer_item.ilosc or 1
        net_amount = offer_item.cena_netto * quantity
        vat_rate = invoice.vat_rate
        gross_amount = net_amount * (1 + vat_rate)
        
        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            type=offer_item.typ,
            width=offer_item.szerokosc,
            height=offer_item.wysokosc,
            quantity=quantity,
            unit_price=offer_item.cena_netto,
            options=option_names,
            net_amount=net_amount,
            gross_amount=gross_amount
        )
        
        db.add(invoice_item)
    
    db.commit()
    db.refresh(invoice)
    return invoice

def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    """
    Get invoice by ID
    """
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()

def get_invoices_for_offer(db: Session, offer_id: int) -> List[Invoice]:
    """
    Get all invoices for an offer
    """
    return db.query(Invoice).filter(Invoice.offer_id == offer_id).all()

def delete_invoice(db: Session, invoice_id: int) -> bool:
    """
    Delete invoice
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if invoice:
        db.delete(invoice)
        db.commit()
        return True
    return False