import os
from sqlalchemy import create_engine  # , Column, Integer, String, Float, TIMESTAMP

# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.models import Base

# from models import Base
import datetime

DATABASE_URL = "postgresql://wife:W0rkParty@localhost/videogames"
# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the tables
Base.metadata.create_all(engine)

print("Tables created!")
