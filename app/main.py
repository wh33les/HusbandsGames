from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Float, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from pydantic import BaseModel
from app import models, crud, schemas, database
from fastapi.middleware.cors import CORSMiddleware



# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
	"http://wh33les.github.io/HusbandsGames",
	"https://localhost:3000"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods
    allow_headers=["*"], # Allows all headers
)

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Hello World"}


# @app.get("/test/")
# def test_route():
#     return {"message": "Test route works!"}


# Route to create a new game
@app.post("/games/")
def create_game(game: schemas.GameCreate, db: Session = Depends(get_db)):
    return crud.create_game(db=db, game=game)


# @app.put("/games/{game_id}/update_price")
# def update_game_price(game_id: int, db: Session = Depends(get_db)):
#     return crud.update_game_price(db=db, game_id=game_id)


# Route to update a game
@app.patch("/games/{game_id}", response_model=schemas.GameResponse)
def update_game(
    game_id: int, game_update: schemas.GameUpdate, db: Session = Depends(get_db)
):
    # Retrieve the existing game from the database
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Update the game attributes with provided values
    for key, value in game_update.dict(exclude_unset=True).items():
        setattr(game, key, value)

    # Commit the changes to the database
    db.commit()
    db.refresh(game)

    # Create a response dictionary
    response = game.dict()
    response["message"] = f"Successfully updated game no. {game.id}, {game.title}."

    return response


# Route to get all games
@app.get("/games/")
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_games(db=db, skip=skip, limit=limit)


# Route to get a game by ID
@app.get("/games/{game_id}")
def get_game(game_id: int, db: Session = Depends(get_db)):
    return crud.get_game(db=db, game_id=game_id)


# # Route to update a game's price
# @app.put("/games/{game_id}")
# def update_game_price(game_id: int, price: float, db: Session = Depends(get_db)):
#     return crud.update_game_price(db=db, game_id=game_id)


# Route to delete a game
@app.delete("/games/{game_id}")
def delete_game(game_id: int, db: Session = Depends(get_db)):
    return crud.delete_game(db=db, game_id=game_id)


# Update all prices
# @app.post("/update-prices/")
# def update_prices(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
#     """Run price update in the background."""
#     background_tasks.add_task(update_game_prices, db)
#     return {"message": "Price update started"}

# @app.post("/update-prices/")
# def update_prices(db: Session = Depends(get_db)):
#     """API endpoint to scrape and update game prices."""
#     crud.update_game_prices(db)
#     return {"message": "Prices updated successfully"}
