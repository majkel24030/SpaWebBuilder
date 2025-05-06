from sqlalchemy import Column, Integer, String, Float, Date, JSON, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from ..database import Base
from app.models.offer import Offer  # Import correct model

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    number = Column(String, nullable=False, unique=True)
    issue_date = Column(Date, default=datetime.date.today, nullable=False)
    due_date = Column(Date, nullable=False)
    payment_method = Column(String, nullable=False, default="przelew bankowy")
    client_info = Column(JSON, nullable=False)  # Store client data
    notes = Column(String, nullable=True)
    vat_rate = Column(Float, nullable=False, default=0.23)  # 23% VAT
    currency = Column(String, nullable=False, default="EUR")
    net_total = Column(Float, nullable=False, default=0.0)
    vat_amount = Column(Float, nullable=False, default=0.0)
    gross_total = Column(Float, nullable=False, default=0.0)

    # Relationships
    offer = relationship("Offer", backref="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Invoice {self.number}>"

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    type = Column(String, nullable=False)  # Product type
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    options = Column(JSON, nullable=False, default={})  # Store options by category
    net_amount = Column(Float, nullable=False)
    gross_amount = Column(Float, nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="items")

    def __repr__(self):
        return f"<InvoiceItem {self.id} for Invoice {self.invoice_id}>"