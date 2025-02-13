# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas, scraper


# Function to create a new game in the database
def create_game(db: Session, game: schemas.GameCreate):
    # Scrape the price before saving the game
    scraped_price = scraper.get_game_price(game.title, game.platform)

    db_game = models.Game(
        title=game.title,
        platform=game.platform,
        release_year=game.release_year,
        genre=game.genre,
        publisher=game.publisher,
        opened=game.opened,
        price=scraped_price,  # Save the scraped price
    )

    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


# Function to update a game
def update_game(db: Session, game_id: int, game_update: schemas.GameUpdate):
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        return None

    for key, value in game_update.dict(exclude_unset=True).items():
        setattr(game, key, value)

    db.commit()
    db.refresh(game)
    return game


# Function to get all games from the database
def get_games(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Game).offset(skip).limit(limit).all()


# Function to get a game by ID
def get_game(db: Session, game_id: int):
    return db.query(models.Game).filter(models.Game.id == game_id).first()


# # Function to update a game's price
# def update_game_price(db: Session, game_id: int):
#     db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
#     if db_game:
#         new_price = scraper.get_game_price(
#             db_game.title, db_game.platform
#         )  # Scrape new price
#         db_game.price = new_price
#         db.commit()
#         db.refresh(db_game)
#     return db_game


# Function to update all games' prices
def update_game_prices(db: Session):
    """Fetch all games and update their prices from eBay."""
    games = db.query(models.Game).all()

    for game in games:
        new_price = scraper.get_game_price(game.title, game.platform)
        if new_price:
            game.price = new_price
            print(f"Updated {game.title}: ${new_price}")

    db.commit()


# Function to delete a game
def delete_game(db: Session, game_id: int):
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if db_game:
        db.delete(db_game)
        db.commit()
    return db_game
