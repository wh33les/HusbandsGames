from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DECIMAL,
    TIMESTAMP,
    func,
)
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Game(Base):
    __tablename__ = "game"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    release_year = Column(Integer, nullable=True)
    region = Column(String, nullable=True)
    genre = Column(String, nullable=True)
    publisher = Column(String, nullable=True)
    opened = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    price = Column(Float, nullable=True)


# class Price(Base):
#     __tablename__ = "price"

#     id = Column(Integer, primary_key=True, index=True)
#     game_id = Column(Integer, ForeignKey("game.id", ondelete="CASCADE"))
#     source = Column(String, nullable=False)
#     price = Column(DECIMAL(10, 2), nullable=False)
#     url = Column(String)
#     scraped_at = Column(TIMESTAMP, default=func.now())
