# =============================================================================
# HUSBAND'S GAMES DATABASE - FASTAPI BACKEND SERVER
# =============================================================================
#
# This is the main FastAPI application that provides a RESTful API for managing
# a video games database. It implements a dual-access pattern with public
# read-only endpoints and admin-protected CRUD operations.
#
# MAIN FEATURES:
# - Public read-only access to games data (no authentication required)
# - JWT-based admin authentication for secure CRUD operations
# - CORS configuration for frontend integration
# - SQLAlchemy ORM integration for database operations
# - Comprehensive data validation using Pydantic models
# - Error handling and HTTP status code management
#
# SECURITY ARCHITECTURE:
# - JWT tokens for stateless authentication
# - Password hashing using SHA-256
# - Role-based access control (admin-only for write operations)
# - CORS whitelist for trusted frontend domains
#
# API STRUCTURE:
# - Public endpoints: GET /games/, GET /games/{id}
# - Authentication: POST /login
# - Admin endpoints: POST/PUT/DELETE /admin/games/
# - Utility endpoints: /health, /debug
#
# DEPENDENCIES:
# - FastAPI: Modern Python web framework for building APIs
# - SQLAlchemy: ORM for database operations
# - Pydantic: Data validation and serialization
# - PyJWT: JSON Web Token implementation
# - CORS middleware: Cross-origin resource sharing
# =============================================================================

# Core FastAPI imports for building the web application
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware  # Handle cross-origin requests
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # JWT security
from pydantic import BaseModel  # Data validation and serialization
from datetime import datetime, timedelta  # Date/time handling for JWT expiration
import jwt  # JSON Web Token encoding/decoding
import hashlib  # Password hashing functionality
from typing import Optional  # Type hints for optional fields
from sqlalchemy.orm import Session  # Database session management

# Local application imports (your existing database/model code)
# These modules contain the database models, CRUD operations, and schemas
from . import models, crud, schemas, database

# =============================================================================
# FASTAPI APPLICATION INITIALIZATION
# =============================================================================

# Create the main FastAPI application instance
# This object will handle all HTTP requests and route them to appropriate functions
app = FastAPI(
    title="Husband's Games Database API",
    description="RESTful API for managing a video games collection",
    version="1.0.0"
)

# =============================================================================
# CORS (CROSS-ORIGIN RESOURCE SHARING) CONFIGURATION
# =============================================================================

# CORS middleware allows the frontend (React app) to make requests to this API
# from different domains. This is essential for web applications where the
# frontend and backend are served from different origins.
app.add_middleware(
    CORSMiddleware,
    # Specify which domains are allowed to make requests to this API
    allow_origins=[
        "http://localhost:3000",        # Local development React app
        "https://wh33les.github.io"     # Deployed frontend on GitHub Pages
    ],
    allow_credentials=True,             # Allow cookies and auth headers
    allow_methods=["*"],                # Allow all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],                # Allow all headers including Authorization
)

# =============================================================================
# DATABASE DEPENDENCY INJECTION
# =============================================================================

# Dependency function that provides database sessions to route handlers
# This follows the dependency injection pattern recommended by FastAPI
def get_db():
    """
    Creates and manages database sessions for each request.
    
    This function:
    1. Creates a new SQLAlchemy session
    2. Yields it to the route handler (dependency injection)
    3. Ensures the session is properly closed after the request
    
    The 'yield' keyword makes this a generator function, which FastAPI
    uses for dependency cleanup (similar to context managers).
    """
    db = database.SessionLocal()  # Create new database session
    try:
        yield db  # Provide session to the route handler
    finally:
        db.close()  # Always close session when request is complete

# =============================================================================
# SECURITY CONFIGURATION AND AUTHENTICATION
# =============================================================================

# HTTP Bearer token security scheme for JWT authentication
# This tells FastAPI to expect "Authorization: Bearer <token>" headers
security = HTTPBearer()

# JWT configuration constants
# WARNING: In production, these should be environment variables!
SECRET_KEY = "your-secret-key-change-this-in-production"  # Used to sign JWT tokens
ALGORITHM = "HS256"  # HMAC with SHA-256 algorithm for JWT signing

# Simple in-memory admin user configuration
# In production, this should be stored securely in a database with proper
# password hashing and potentially multiple admin users
ADMIN_USER = {
    "username": "admin",
    # Pre-hashed password for "W0rkP@rty" using SHA-256
    # This avoids storing plain-text passwords in code
    "password_hash": "e954ef868c2f62ada72e590296dc2c3836d42130b4cd648ed211798d71806376",
    "name": "Administrator"
}

# =============================================================================
# PYDANTIC MODELS FOR REQUEST/RESPONSE VALIDATION
# =============================================================================

# Pydantic models define the structure and validation rules for API data.
# They automatically validate incoming requests and serialize outgoing responses.

class LoginRequest(BaseModel):
    """
    Model for admin login requests.
    
    Validates that both username and password are provided as strings.
    FastAPI will automatically return a 422 error if validation fails.
    """
    username: str
    password: str

class LoginResponse(BaseModel):
    """
    Model for successful login responses.
    
    Returns the JWT access token and basic user information.
    This follows OAuth 2.0 Bearer token response patterns.
    """
    access_token: str
    user: dict

class GameCreate(BaseModel):
    """
    Model for creating new games.
    
    Defines all the fields that can be provided when adding a new game.
    Only 'title' is required; all other fields are optional with defaults.
    """
    title: str                          # Required: Game title
    platform: Optional[str] = None      # Optional: Gaming platform (PS5, PC, etc.)
    genre: Optional[str] = None         # Optional: Game genre (Action, RPG, etc.)
    release_year: Optional[int] = None  # Optional: Year the game was released
    price: Optional[float] = None       # Optional: Price of the game
    region: Optional[str] = None        # Optional: Region code (US, EU, JP)
    publisher: Optional[str] = None     # Optional: Game publisher/developer
    opened: Optional[bool] = False      # Optional: Has the game been opened/played

class GameUpdate(BaseModel):
    """
    Model for updating existing games.
    
    All fields are optional since partial updates should be supported.
    Only provided fields will be updated in the database.
    """
    title: Optional[str] = None
    platform: Optional[str] = None
    genre: Optional[str] = None
    release_year: Optional[int] = None
    price: Optional[float] = None
    region: Optional[str] = None
    publisher: Optional[str] = None
    opened: Optional[bool] = None

class GameResponse(BaseModel):
    """
    Model for game data responses.
    
    Defines the structure of game data when returned from the API.
    Includes all game fields plus metadata like ID and creation timestamp.
    """
    id: int                             # Database ID (auto-generated)
    title: str                          # Game title
    platform: Optional[str] = None      # Gaming platform
    genre: Optional[str] = None         # Game genre
    release_year: Optional[int] = None  # Release year
    price: Optional[float] = None       # Game price
    region: Optional[str] = None        # Region code
    publisher: Optional[str] = None     # Publisher/developer
    opened: Optional[bool] = False      # Opened/played status
    created_at: datetime                # When record was created

# =============================================================================
# AUTHENTICATION AND SECURITY HELPER FUNCTIONS
# =============================================================================

def hash_password(password: str) -> str:
    """
    Hash a plain-text password using SHA-256.
    
    Args:
        password: Plain-text password to hash
        
    Returns:
        Hexadecimal string representation of the hashed password
        
    Note: In production, consider using bcrypt or Argon2 for better security
    as they include salt and are designed to be slow to prevent brute force.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain-text password against a stored hash.
    
    Args:
        password: Plain-text password to verify
        password_hash: Stored hash to compare against
        
    Returns:
        True if password matches the hash, False otherwise
    """
    return hash_password(password) == password_hash

def create_access_token(data: dict):
    """
    Create a JWT access token with expiration time.
    
    Args:
        data: Dictionary containing claims to include in the token
              (typically user identifier and permissions)
              
    Returns:
        Encoded JWT token as a string
        
    The token includes:
    - Original data (claims)
    - Expiration time (24 hours from creation)
    - Digital signature for verification
    """
    to_encode = data.copy()  # Don't modify the original data
    
    # Set token expiration to 24 hours from now
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    # Encode and sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency function to verify admin JWT tokens.
    
    This function is used as a dependency in protected routes to ensure
    only authenticated admin users can access them.
    
    Args:
        credentials: Authorization header with Bearer token (injected by FastAPI)
        
    Returns:
        Username of the authenticated admin user
        
    Raises:
        HTTPException: 401 if token is invalid, 403 if user is not admin
        
    Usage:
        @app.post("/admin/games")
        async def create_game(current_user: str = Depends(verify_admin_token)):
            # This route is now protected and only accessible to admins
    """
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract username from token payload
        username: str = payload.get("sub")
        
        # Verify that the user has admin privileges
        if username != "admin":
            raise HTTPException(
                status_code=403, 
                detail="Admin access required"
            )
            
        return username
        
    except jwt.PyJWTError:
        # Token is invalid, expired, or malformed
        raise HTTPException(
            status_code=401, 
            detail="Invalid token"
        )

# =============================================================================
# PUBLIC API ROUTES (NO AUTHENTICATION REQUIRED)
# =============================================================================

# These routes are accessible to anyone and provide read-only access to the
# games database. This allows the frontend to display games to all users.

@app.get("/")
async def root():
    """
    Root endpoint providing basic API information.
    
    This is typically used for:
    - API health checks
    - Basic connectivity testing
    - Providing API metadata
    """
    return {"message": "Husband's Games API"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    This endpoint can be used by:
    - Monitoring systems to verify API availability
    - Load balancers to determine if the service is healthy
    - Deployment systems to verify successful deployments
    """
    return {"status": "healthy"}

@app.get("/games/")
def get_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of games with pagination support.
    
    This is the main public endpoint that provides access to the games database.
    Anyone can call this endpoint to view the games collection.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (max 100)
        db: Database session (injected by FastAPI dependency system)
        
    Returns:
        List of games with reordered columns for better frontend display
        
    Features:
        - Pagination support for large datasets
        - Column reordering for optimal user experience
        - No authentication required (public access)
    """
    # Fetch games from database using CRUD operations
    games = crud.get_games(db=db, skip=skip, limit=limit)
    
    # Reorder columns for better user experience in the frontend table
    # This ensures important information (title, platform) appears first
    reordered_games = []
    for game in games:
        reordered_game = {
            "title": game.title,              # 1st column - Most important
            "platform": game.platform,        # 2nd column - Platform info
            "genre": game.genre,              # 3rd column - Genre classification
            "release_year": game.release_year, # 4th column - When it was released
            "price": game.price,              # 5th column - Cost information
            "region": game.region,            # 6th column - Regional variant
            "publisher": game.publisher,      # 7th column - Who made it
            "opened": game.opened,            # 8th column - Personal status
            "id": game.id,                    # 9th column - Database identifier
            "created_at": game.created_at     # 10th column - When added to DB
        }
        reordered_games.append(reordered_game)
    
    return reordered_games

@app.get("/games/{game_id}")
def get_game(game_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific game by its ID.
    
    Args:
        game_id: Unique identifier for the game
        db: Database session (injected by dependency)
        
    Returns:
        Single game object with all its details
        
    Raises:
        HTTPException: 404 if game with given ID doesn't exist
    """
    return crud.get_game(db=db, game_id=game_id)

# =============================================================================
# AUTHENTICATION ROUTES
# =============================================================================

@app.post("/login", response_model=LoginResponse)
async def admin_login(login_data: LoginRequest):
    """
    Authenticate admin users and provide JWT access tokens.
    
    This endpoint handles the login process for administrators who need
    write access to the games database.
    
    Args:
        login_data: LoginRequest containing username and password
        
    Returns:
        LoginResponse with JWT token and user information
        
    Raises:
        HTTPException: 401 if credentials are invalid
        
    Security Flow:
    1. Validate username matches admin user
    2. Verify password using hash comparison
    3. Generate JWT token with 24-hour expiration
    4. Return token and user info for frontend storage
    """
    
    # Verify username and password against stored admin credentials
    if (login_data.username != ADMIN_USER["username"] or 
        not verify_password(login_data.password, ADMIN_USER["password_hash"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Create JWT token for authenticated admin
    access_token = create_access_token(data={"sub": ADMIN_USER["username"]})
    
    # Return token and user information
    return LoginResponse(
        access_token=access_token,
        user={
            "username": ADMIN_USER["username"], 
            "name": ADMIN_USER["name"]
        }
    )

@app.get("/admin/me")
async def get_current_admin(current_user: str = Depends(verify_admin_token)):
    """
    Get information about the currently authenticated admin user.
    
    This endpoint allows the frontend to verify the current admin session
    and retrieve user information for display purposes.
    
    Args:
        current_user: Username extracted from JWT token (injected by dependency)
        
    Returns:
        Admin user information (username and display name)
        
    Security:
        Requires valid admin JWT token in Authorization header
    """
    return {
        "username": ADMIN_USER["username"], 
        "name": ADMIN_USER["name"]
    }

# =============================================================================
# ADMIN-PROTECTED CRUD ROUTES
# =============================================================================

# These routes require admin authentication and provide full CRUD operations
# for managing the games database. Each route uses the verify_admin_token
# dependency to ensure only authenticated admins can access them.

@app.post("/admin/games", response_model=GameResponse)
async def create_game(
    game: GameCreate, 
    current_user: str = Depends(verify_admin_token), 
    db: Session = Depends(get_db)
):
    """
    Create a new game in the database.
    
    This endpoint allows admin users to add new games to the collection.
    All game data is validated using the GameCreate Pydantic model.
    
    Args:
        game: GameCreate object with new game data
        current_user: Authenticated admin username (from JWT token)
        db: Database session (injected by dependency)
        
    Returns:
        GameResponse with the newly created game including auto-generated ID
        
    Security:
        Requires valid admin JWT token
        
    Database Operations:
    1. Create new Game model instance with provided data
    2. Add to database session
    3. Commit transaction to save permanently
    4. Refresh to get auto-generated fields (ID, created_at)
    5. Return complete game object
    """
    
    # Create a new game instance using SQLAlchemy ORM
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
    
    # Add the new game to the database session
    db.add(db_game)
    
    # Commit the transaction to save the game permanently
    db.commit()
    
    # Refresh the instance to get auto-generated fields (ID, timestamp)
    db.refresh(db_game)
    
    # Return the complete game object with all fields
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
    current_user: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """
    Update an existing game in the database.
    
    This endpoint allows admin users to modify existing games.
    Only provided fields will be updated (partial updates supported).
    
    Args:
        game_id: ID of the game to update
        game_update: GameUpdate object with fields to modify
        current_user: Authenticated admin username (from JWT token)
        db: Database session (injected by dependency)
        
    Returns:
        GameResponse with the updated game data
        
    Raises:
        HTTPException: 404 if game with given ID doesn't exist
        
    Security:
        Requires valid admin JWT token
        
    Note: This is currently a placeholder implementation.
    The commented code shows how to implement full update functionality.
    """
    
    # TODO: Implement full update functionality
    # The commented code below shows the proper implementation:
    
    # # Find the game in the database
    # db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    # if not db_game:
    #     raise HTTPException(status_code=404, detail="Game not found")
    # 
    # # Update only the fields that were provided
    # for field, value in game_update.dict(exclude_unset=True).items():
    #     setattr(db_game, field, value)
    # 
    # # Save changes to database
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
async def delete_game(
    game_id: int, 
    current_user: str = Depends(verify_admin_token), 
    db: Session = Depends(get_db)
):
    """
    Delete a game from the database.
    
    This endpoint allows admin users to remove games from the collection.
    The deletion is permanent and cannot be undone.
    
    Args:
        game_id: ID of the game to delete
        current_user: Authenticated admin username (from JWT token)
        db: Database session (injected by dependency)
        
    Returns:
        Success message with the title of the deleted game
        
    Raises:
        HTTPException: 404 if game with given ID doesn't exist
        
    Security:
        Requires valid admin JWT token
        
    Database Operations:
    1. Query database to find the game by ID
    2. Verify game exists (return 404 if not found)
    3. Delete the game from the session
    4. Commit transaction to make deletion permanent
    5. Return confirmation message
    """
    
    # Find the game in the database
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    
    # Return 404 if game doesn't exist
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Store title for confirmation message before deletion
    game_title = db_game.title
    
    # Delete the game from the database
    db.delete(db_game)
    db.commit()
    
    # Return confirmation message
    return {"message": f"Game '{game_title}' deleted successfully"}

# =============================================================================
# UTILITY AND DEBUG ROUTES
# =============================================================================

@app.get("/debug")
async def debug_routes():
    """
    Debug endpoint that lists all available API routes.
    
    This is useful for:
    - Development and debugging
    - API documentation and exploration
    - Verifying route registration
    
    Returns:
        Dictionary containing all registered routes with their methods
        
    Note: In production, consider removing or securing this endpoint
    to avoid exposing internal API structure.
    """
    routes = []
    
    # Iterate through all registered routes in the FastAPI app
    for route in app.routes:
        # Only include routes that have HTTP methods and paths
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            routes.append({
                "path": route.path,              # Route path (e.g., "/games/")
                "methods": list(route.methods)   # HTTP methods (GET, POST, etc.)
            })
    
    return {"available_routes": routes}

# =============================================================================
# APPLICATION ENTRY POINT AND CONFIGURATION
# =============================================================================

# When this file is run directly (not imported), you could add additional
# configuration or startup logic here. FastAPI applications are typically
# run using ASGI servers like Uvicorn:
#
# Command to run the server:
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
#
# The 'app' object defined above is what the ASGI server will serve.

# =============================================================================
# PRODUCTION CONSIDERATIONS AND SECURITY NOTES
# =============================================================================

# SECURITY IMPROVEMENTS FOR PRODUCTION:
# 1. Move SECRET_KEY to environment variables
# 2. Use proper password hashing (bcrypt/Argon2) instead of SHA-256
# 3. Implement rate limiting to prevent brute force attacks
# 4. Add request logging and monitoring
# 5. Use HTTPS only and set secure cookie flags
# 6. Implement proper CORS policies based on deployment domains
# 7. Add input sanitization for SQL injection prevention
# 8. Consider implementing refresh tokens for longer sessions
# 9. Add comprehensive error handling and logging
# 10. Implement database connection pooling and optimization

# SCALABILITY IMPROVEMENTS:
# 1. Add database indexing for frequently queried fields
# 2. Implement caching for read-heavy operations
# 3. Add pagination to all list endpoints
# 4. Consider implementing database migrations
# 5. Add comprehensive API testing and documentation
# 6. Implement monitoring and health checks
# 7. Add graceful shutdown handling
# 8. Consider containerization with Docker
# 9. Implement proper logging and error tracking
# 10. Add API versioning for future compatibility