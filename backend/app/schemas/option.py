from typing import List, Optional
from pydantic import BaseModel, Field

class OptionBase(BaseModel):
    id_opcji: str = Field(..., min_length=3, description="Option ID")
    kategoria: str = Field(..., description="Option category")
    nazwa: str = Field(..., description="Option name")
    cena_netto_eur: float = Field(..., ge=0, description="Net price in EUR")

class OptionCreate(OptionBase):
    pass

class OptionUpdate(BaseModel):
    kategoria: Optional[str] = None
    nazwa: Optional[str] = None
    cena_netto_eur: Optional[float] = None

class OptionInDB(OptionBase):
    class Config:
        orm_mode = True

class Option(OptionInDB):
    pass

class OptionCategory(BaseModel):
    name: str
