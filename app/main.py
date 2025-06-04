from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import hashlib
from typing import Optional
from sqlalchemy.orm import Session

# Your existing imports (keep these)
from . import models, crud, schemas, database

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://wh33les.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-change-this-in-production"  # Change this!
ALGORITHM = "HS256"

# Simple admin user (in production, use environment variables)
ADMIN_USER = {
    "username": "admin",
    "password_hash": "e954ef868c2f62ada72e590296dc2c3836d42130b4cd648ed211798d71806376",  # "W0rkP@rty"
    "name": "Administrator"
}


# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: dict

class GameCreate(BaseModel):
    title: str
    platform: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    price: Optional[float] = None
    region: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = False

class GameUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    price: Optional[float] = None
    region: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = None

class GameResponse(BaseModel):
    id: int
    title: str
    platform: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    price: Optional[float] = None
    region: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = False
    created_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Public Routes (no authentication required)
# Route to get all games
@app.get("/games/")
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    games = crud.get_games(db=db, skip=skip, limit=limit)
    
    # Reorder the columns by creating a new list with desired order
    reordered_games = []
    for game in games:
        reordered_game = {
            "title": game.title,           # 1st column
            "platform": game.platform,     # 2nd column  
            "genre": game.genre,           # 3rd column
            "release_year": game.release_year, # 4th column
            "price": game.price,           # 5th column
            "region": game.region,         # 6th column
            "publisher": game.publisher,   # 7th column
            "opened": game.opened,         # 8th column
            "id": game.id,                 # 9th column
            "created_at": game.created_at  # 10th column
        }
        reordered_games.append(reordered_game)
    
    return reordered_games


# Route to get a game by ID
@app.get("/games/{game_id}")
def get_game(game_id: int, db: Session = Depends(get_db)):
    return crud.get_game(db=db, game_id=game_id)

@app.get("/")
async def root():
    return {"message": "Husband's Games API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Admin-only Routes
@app.post("/login", response_model=LoginResponse)
async def admin_login(login_data: LoginRequest):
    if (login_data.username != ADMIN_USER["username"] or 
        not verify_password(login_data.password, ADMIN_USER["password_hash"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    access_token = create_access_token(data={"sub": ADMIN_USER["username"]})
    return LoginResponse(
        access_token=access_token,
        user={"username": ADMIN_USER["username"], "name": ADMIN_USER["name"]}
    )

@app.get("/admin/me")
async def get_current_admin(current_user: str = Depends(verify_admin_token)):
    return {"username": ADMIN_USER["username"], "name": ADMIN_USER["name"]}

@app.post("/admin/games", response_model=GameResponse)
async def create_game(game: GameCreate, current_user: str = Depends(verify_admin_token), db: Session = Depends(get_db)):
    # Create a new game using your existing models
    db_game = models.Game(
        title=game.title,
        platform=game.platform,
        genre=game.genre,
        release_year=game.release_year,
        price=game.price,
        region=game.region,
        publisher=game.publisher,
        opened=game.opened
    )
    
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    
    return GameResponse(
        id=db_game.id,
        title=db_game.title,
        platform=db_game.platform,
        genre=db_game.genre,
        release_year=db_game.release_year,
        price=db_game.price,
        region=db_game.region,
        publisher=db_game.publisher,
        opened=db_game.opened,
        created_at=db_game.created_at
    )

@app.put("/admin/games/{game_id}", response_model=GameResponse)
async def update_game(
    game_id: int, 
    game_update: GameUpdate, 
    current_user: str = Depends(verify_admin_token)
):
    # Here you'll integrate with your existing database code
    # Example:
    # db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    # if not db_game:
    #     raise HTTPException(status_code=404, detail="Game not found")
    # 
    # for field, value in game_update.dict(exclude_unset=True).items():
    #     setattr(db_game, field, value)
    # 
    # db.commit()
    # db.refresh(db_game)
    # return db_game
    
    # Placeholder response for now:
    return GameResponse(
        id=game_id,
        created_at=datetime.utcnow(),
        title="Updated Game",
        platform="Updated Platform"
    )

@app.delete("/admin/games/{game_id}")
async def delete_game(game_id: int, current_user: str = Depends(verify_admin_token), db: Session = Depends(get_db)):
    # Find the game in the database
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Delete the game
    db.delete(db_game)
    db.commit()
    
    return {"message": f"Game '{db_game.title}' deleted successfully"}

@app.get("/debug")
async def debug_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods)
            })
    return {"available_routes": routes}