import os
import tempfile
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from sqlalchemy.orm import Session

from app.models.offer import Offer, OfferItem
from app.models.option import Option
from app.config import settings

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
        
        # Create item data
        items_data.append({
            "id": item.id,
            "type_name": type_name,
            "width": item.szerokosc,
            "height": item.wysokosc,
            "configuration": config_data,
            "price_net": item.cena_netto
        })
    
    # Prepare data for template
    template_data = {
        "offer": {
            "number": offer.numer,
            "date": offer.data,
            "customer": offer.klient,
            "notes": offer.uwagi,
            "net_total": offer.suma_netto,
            "vat_total": offer.suma_vat,
            "gross_total": offer.suma_brutto
        },
        "items": items_data,
        "vat_rate": 23  # 23% VAT
    }
    
    # Render template to HTML
    template_loader = FileSystemLoader(searchpath="./app/templates")
    template_env = Environment(loader=template_loader)
    template = template_env.get_template("offer_template.html")
    html_content = template.render(**template_data)
    
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
