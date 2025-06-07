# app/schemas.py
from pydantic import BaseModel
from typing import Optional
import datetime


class Game(BaseModel):
    id: int
    title: str
    platform: str
    release_year: int
    region: Optional[str] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = True
    price: Optional[float] = None

    class Config:
        orm_mode = True  # Enables ORM conversion from SQLAlchemy


# Pydantic model for validation
class GameCreate(BaseModel):
    title: str
    platform: str
    release_year: int
    region: Optional[str] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = True
    price: Optional[float] = None


class GameUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    release_year: Optional[int] = None
    region: Optional[str] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = True
    price: Optional[float] = None

    class Config:
        from_attributes = True  # or orm_mode = True for older Pydantic


class GameResponse(BaseModel):
    id: int
    title: str
    platform: str
    release_year: int
    region: Optional[str] = None
    genre: Optional[str] = None
    publisher: str
    opened: Optional[bool] = True
    created_at: datetime.datetime
    price: Optional[float] = None

    class Config:
        orm_mode = True
