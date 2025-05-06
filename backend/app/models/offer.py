from sqlalchemy import Boolean, Column, Integer, String, Float, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base
import datetime

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    numer = Column(String, nullable=False)
    data = Column(Date, default=datetime.date.today, nullable=False)
    klient = Column(String, nullable=False)
    uwagi = Column(String, nullable=True)
    suma_netto = Column(Float, nullable=False, default=0.0)
    suma_vat = Column(Float, nullable=False, default=0.0)
    suma_brutto = Column(Float, nullable=False, default=0.0)

    # Relationships
    user = relationship("User", back_populates="offers")
    items = relationship("OfferItem", back_populates="offer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Offer {self.numer} for {self.klient}>"


class OfferItem(Base):
    __tablename__ = "offer_items"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    typ = Column(String, nullable=False)  # References options.id_opcji
    szerokosc = Column(Integer, nullable=False)
    wysokosc = Column(Integer, nullable=False)
    konfiguracja = Column(JSON, nullable=False, default={})  # Store option IDs by category
    cena_netto = Column(Float, nullable=False)
    ilosc = Column(Integer, nullable=False, default=1)  # Ilość okien tego typu

    # Relationships
    offer = relationship("Offer", back_populates="items")

    def __repr__(self):
        return f"<OfferItem {self.id} ({self.szerokosc}x{self.wysokosc})>"
