import csv
from sqlalchemy.orm import Session
from app.models.option import Option
from app.config import settings

def load_options_from_csv(db: Session, csv_file_path: str) -> None:
    """
    Load options from CSV file
    CSV format: ID_OPCJI,KATEGORIA,NAZWA,CENA_NETTO_EUR
    """
    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            # Clear existing options if any
            db.query(Option).delete()
            
            # Add new options from CSV
            for row in csv_reader:
                option = Option(
                    id_opcji=row['ID_OPCJI'],
                    kategoria=row['KATEGORIA'],
                    nazwa=row['NAZWA'],
                    cena_netto_eur=float(row['CENA_NETTO_EUR'])
                )
                db.add(option)
            
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error loading options from CSV: {e}")
        raise
