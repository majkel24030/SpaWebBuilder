from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, Invoice, InvoiceClientInfo
from app.services.invoice import (
    create_invoice_from_offer,
    get_invoice,
    get_invoices_for_offer,
    delete_invoice
)
from app.services.pdf import generate_invoice_pdf
from app.services.offer import is_offer_owner_or_admin, check_offer_exists

router = APIRouter()

@router.post("/{offer_id}", response_model=Invoice)
def create_invoice(
    offer_id: int,
    client_info: InvoiceClientInfo,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Create a new invoice for an offer
    """
    # Verify offer exists and user has access
    offer = check_offer_exists(db, offer_id)
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this offer"
        )
    
    try:
        invoice = create_invoice_from_offer(db, offer_id, client_info)
        return invoice
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not create invoice: {str(e)}"
        )

@router.get("/offer/{offer_id}", response_model=List[Invoice])
def read_invoices_for_offer(
    offer_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get all invoices for an offer
    """
    # Verify offer exists and user has access
    offer = check_offer_exists(db, offer_id)
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this offer"
        )
    
    return get_invoices_for_offer(db, offer_id)

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(
    invoice_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get invoice by ID
    """
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )
    
    # Verify user has access to the related offer
    offer = check_offer_exists(db, invoice.offer_id)
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this invoice"
        )
    
    return invoice

@router.get("/{invoice_id}/pdf")
def generate_pdf(
    invoice_id: int,
    token: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user)
):
    """
    Generate PDF for invoice
    """
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )
    
    # If no valid token, check user permissions
    if not token and current_user:
        # Verify user has access to the related offer
        offer = check_offer_exists(db, invoice.offer_id)
        if not is_offer_owner_or_admin(offer, current_user):
            raise HTTPException(
                status_code=403, 
                detail="Not enough permissions to access this invoice"
            )
    
    try:
        pdf_content = generate_invoice_pdf(db, invoice_id)
        
        # Return PDF as response
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Invoice_{invoice.number}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {str(e)}"
        )

@router.delete("/{invoice_id}", status_code=204)
def delete_invoice_endpoint(
    invoice_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Delete invoice
    """
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )
    
    # Verify user has access to the related offer
    offer = check_offer_exists(db, invoice.offer_id)
    if not is_offer_owner_or_admin(offer, current_user):
        raise HTTPException(
            status_code=403, 
            detail="Not enough permissions to access this invoice"
        )
    
    delete_invoice(db, invoice_id)
    return Response(status_code=204)