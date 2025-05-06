import os
import tempfile
import base64
from datetime import datetime
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from sqlalchemy.orm import Session

from app.models.offer import Offer, OfferItem
from app.models.option import Option
from app.models.invoice import Invoice, InvoiceItem
from app.config import settings

def _get_template_path(template_file: str) -> str:
    """
    Helper function to find the template path
    """
    template_paths = [
        "./app/templates",
        "./backend/app/templates",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
    ]
    
    for path in template_paths:
        if os.path.exists(os.path.join(path, template_file)):
            return path
    
    raise Exception(f"Nie można znaleźć szablonu {template_file} w ścieżkach: {template_paths}")

def _get_default_company_logo() -> str:
    """
    Return a base64 encoded default company logo
    """
    # Create a simple SVG logo
    svg_logo = """
    <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="80" fill="#2563eb" rx="10" ry="10"/>
        <text x="20" y="45" font-family="Arial" font-size="24" fill="white" font-weight="bold">WindoorConfig</text>
        <text x="22" y="65" font-family="Arial" font-size="12" fill="white">Professional Window Solutions</text>
    </svg>
    """
    return base64.b64encode(svg_logo.encode()).decode()

def generate_offer_pdf(db: Session, offer: Offer) -> bytes:
    """
    Generate a PDF for an offer using Jinja2 and WeasyPrint
    """
    # Get all options used in the offer
    option_ids = set()
    for item in offer.items:
        option_ids.add(item.typ)  # Add product type
        for option_id in item.konfiguracja.values():
            option_ids.add(option_id)  # Add configuration options
    
    options = db.query(Option).filter(Option.id_opcji.in_(option_ids)).all()
    options_dict = {option.id_opcji: option for option in options}
    
    # Prepare item data for template
    items_data = []
    for item in offer.items:
        # Get product type name
        type_option = options_dict.get(item.typ)
        type_name = type_option.nazwa if type_option else "Unknown Product"
        
        # Get configuration options
        config_data = {}
        for category, option_id in item.konfiguracja.items():
            option = options_dict.get(option_id)
            config_data[category] = option.nazwa if option else "Unknown Option"
        
        # Pobierz ilość okien (domyślnie 1, jeśli nie jest zdefiniowana)
        quantity = getattr(item, 'ilosc', 1)
        
        # Create item data
        items_data.append({
            "id": item.id,
            "type_name": type_name,
            "width": item.szerokosc,
            "height": item.wysokosc,
            "configuration": config_data,
            "price_net": item.cena_netto,
            "quantity": quantity,
            "total_price_net": item.cena_netto * quantity
        })
    
    # Oblicz całkowitą ilość produktów
    total_quantity = sum(item["quantity"] for item in items_data)
    
    # Prepare data for template
    template_data = {
        "offer": offer,  # Przekaż bezpośrednio obiekt oferty
        "items": offer.items,  # Przekaż bezpośrednio elementy oferty
        "vat_rate": 23  # 23% VAT
    }
    
    # Render template to HTML
    try:
        import os
        # Użyj ścieżki względnej z różnych możliwych lokalizacji
        template_paths = [
            "./app/templates",
            "./backend/app/templates",
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
        ]
        # Znajdź poprawną ścieżkę
        template_path = None
        for path in template_paths:
            if os.path.exists(os.path.join(path, "offer_template.html")):
                template_path = path
                break
        
        if not template_path:
            raise Exception(f"Nie można znaleźć szablonu offer_template.html w ścieżkach: {template_paths}")
            
        template_loader = FileSystemLoader(searchpath=template_path)
        template_env = Environment(loader=template_loader)
        template = template_env.get_template("offer_template.html")
        html_content = template.render(**template_data)
    except Exception as e:
        print(f"Błąd podczas renderowania szablonu: {e}")
        raise
    
    # Generate PDF from HTML
    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as html_file:
        html_file.write(html_content.encode('utf-8'))
        html_file_path = html_file.name
    
    try:
        # Create PDF
        pdf = HTML(filename=html_file_path).write_pdf()
        return pdf
    finally:
        # Clean up temporary file
        if os.path.exists(html_file_path):
            os.unlink(html_file_path)

def generate_invoice_pdf(db: Session, invoice_id: int) -> bytes:
    """
    Generate a PDF for an invoice using Jinja2 and WeasyPrint
    """
    # Get invoice with items
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise ValueError(f"Invoice with ID {invoice_id} not found")
    
    # Get related offer
    offer = db.query(Offer).filter(Offer.id == invoice.offer_id).first()
    if not offer:
        raise ValueError(f"Associated offer with ID {invoice.offer_id} not found")
    
    # Convert client_info JSON to a dict
    client_info = invoice.client_info
    
    # Create invoice items data
    invoice_items = []
    for item in invoice.items:
        invoice_items.append({
            "id": item.id,
            "type": item.type,
            "width": item.width,
            "height": item.height,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "options": item.options,
            "net_amount": item.net_amount,
            "gross_amount": item.gross_amount
        })
    
    # Prepare invoice data for template
    invoice_data = {
        "id": invoice.id,
        "number": invoice.number,
        "issue_date": invoice.issue_date.strftime("%d.%m.%Y"),
        "due_date": invoice.due_date.strftime("%d.%m.%Y"),
        "payment_method": invoice.payment_method,
        "client": client_info,
        "items": invoice_items,
        "net_total": invoice.net_total,
        "vat_rate": invoice.vat_rate,
        "vat_amount": invoice.vat_amount,
        "gross_total": invoice.gross_total,
        "currency": invoice.currency,
        "notes": invoice.notes
    }
    
    # Prepare data for template
    template_data = {
        "invoice": invoice_data,
        "company_logo": _get_default_company_logo(),
        "current_year": datetime.now().year
    }
    
    # Render template to HTML
    try:
        template_path = _get_template_path("invoice_template.html")
        template_loader = FileSystemLoader(searchpath=template_path)
        template_env = Environment(loader=template_loader)
        template = template_env.get_template("invoice_template.html")
        html_content = template.render(**template_data)
    except Exception as e:
        print(f"Błąd podczas renderowania szablonu faktury: {e}")
        raise
    
    # Generate PDF from HTML
    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as html_file:
        html_file.write(html_content.encode('utf-8'))
        html_file_path = html_file.name
    
    try:
        # Create PDF
        pdf = HTML(filename=html_file_path).write_pdf()
        return pdf
    finally:
        # Clean up temporary file
        if os.path.exists(html_file_path):
            os.unlink(html_file_path)
