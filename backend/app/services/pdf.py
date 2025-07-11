import os
import tempfile
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from sqlalchemy.orm import Session

from backend.app.models.offer import Offer, OfferItem
from backend.app.models.option import Option
from backend.app.config import settings

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
