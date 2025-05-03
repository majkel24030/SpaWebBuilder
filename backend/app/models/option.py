from sqlalchemy import Column, String, Float, UniqueConstraint

from app.database import Base

class Option(Base):
    __tablename__ = "options"

    id_opcji = Column(String, primary_key=True, index=True)
    kategoria = Column(String, nullable=False, index=True)
    nazwa = Column(String, nullable=False)
    cena_netto_eur = Column(Float, nullable=False, default=0.0)

    __table_args__ = (
        UniqueConstraint('id_opcji', name='unique_option_id'),
    )

    def __repr__(self):
        return f"<Option {self.id_opcji}: {self.nazwa} ({self.cena_netto_eur} EUR)>"
