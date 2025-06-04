# Update your app/main.py file on the EC2 server

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import hashlib
from typing import Optional

# Your existing imports (keep these)
# from . import models, crud, schemas, database

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

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-change-this-in-production"  # Change this!
ALGORITHM = "HS256"

# Simple admin user (in production, use environment variables)
ADMIN_USER = {
    "username": "admin",
    "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",  # "password"
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
@app.get("/api/games")
async def get_games():
    # Your existing code to get games from database
    # This should work without authentication
    pass

@app.get("/")
async def root():
    return {"message": "Husband's Games API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Admin-only Routes
@app.post("/api/login", response_model=LoginResponse)
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

@app.get("/api/admin/me")
async def get_current_admin(current_user: str = Depends(verify_admin_token)):
    return {"username": ADMIN_USER["username"], "name": ADMIN_USER["name"]}

@app.post("/api/admin/games", response_model=GameResponse)
async def create_game(game: GameCreate, current_user: str = Depends(verify_admin_token)):
    # Here you'll integrate with your existing database code
    # Example integration with your existing models:
    # db_game = models.Game(**game.dict())
    # db.add(db_game)
    # db.commit()
    # db.refresh(db_game)
    # return db_game
    
    # Placeholder response for now:
    return GameResponse(
        id=999,  # This should come from your database
        created_at=datetime.utcnow(),
        **game.dict()
    )

@app.put("/api/admin/games/{game_id}", response_model=GameResponse)
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

@app.delete("/api/admin/games/{game_id}")
async def delete_game(game_id: int, current_user: str = Depends(verify_admin_token)):
    # Here you'll integrate with your existing database code
    # Example:
    # db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    # if not db_game:
    #     raise HTTPException(status_code=404, detail="Game not found")
    # 
    # db.delete(db_game)
    # db.commit()
    # return {"message": "Game deleted successfully"}
    
    return {"message": f"Game {game_id} deleted successfully"}