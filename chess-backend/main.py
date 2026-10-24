from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from passlib.context import CryptContext
import requests
import secrets
from pydantic import BaseModel

import models
import schemas
from database import engine, get_db

# 1. Automatically create new tables AND missing columns on existing tables
def ensure_tables_and_columns():
    models.Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    
    if "users" in inspector.get_table_names():
        existing_columns = [col["name"] for col in inspector.get_columns("users")]
        with engine.begin() as conn:
            if "wins" not in existing_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN wins INT NOT NULL DEFAULT 0"))
            if "losses" not in existing_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN losses INT NOT NULL DEFAULT 0"))
            if "total_games" not in existing_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN total_games INT NOT NULL DEFAULT 0"))

ensure_tables_and_columns()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        wins=0,
        losses=0,
        total_games=0
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email
    }

# --- GOOGLE AUTHENTICATION ---
class GoogleAuthRequest(BaseModel):
    token: str

@app.post("/auth/google")
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    google_response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {request.token}"}
    )
    
    if google_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
        
    user_info = google_response.json()
    email = user_info.get("email")
    username = user_info.get("name", email.split("@")[0])

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    db_user = db.query(models.User).filter(models.User.email == email).first()
    
    if not db_user:
        random_pwd = secrets.token_urlsafe(16)
        hashed_pwd = get_password_hash(random_pwd)
        
        db_user = models.User(
            username=username,
            email=email,
            hashed_password=hashed_pwd,
            wins=0,
            losses=0,
            total_games=0
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    return {
        "message": "Google Authentication successful",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email
    }

# --- ANALYZE & FETCH REAL USER STATS FROM DATABASE ---
@app.get("/users/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Analyze game_matches table for this user
    match_count = db.query(models.GameMatch).filter(models.GameMatch.user_id == user_id).count()
    
    if match_count > 0:
        wins = db.query(models.GameMatch).filter(
            models.GameMatch.user_id == user_id,
            models.GameMatch.result == "win"
        ).count()
        losses = db.query(models.GameMatch).filter(
            models.GameMatch.user_id == user_id,
            models.GameMatch.result == "loss"
        ).count()
        
        # Keep users table synced with analyzed match history
        db_user.wins = wins
        db_user.losses = losses
        db_user.total_games = match_count
        db.commit()

    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "wins": db_user.wins,
        "losses": db_user.losses,
        "total_games": db_user.total_games
    }

# --- RECORD GAME RESULT WHEN A MATCH FINISHES ---
@app.post("/matches")
def record_match(match: schemas.MatchRecordCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == match.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Insert new match record into game_matches table
    new_match = models.GameMatch(
        user_id=match.user_id,
        mode=match.mode,
        result=match.result
    )
    db.add(new_match)

    # 2. Update user's summary counters
    db_user.total_games += 1
    if match.result == "win":
        db_user.wins += 1
    elif match.result == "loss":
        db_user.losses += 1

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Match recorded",
        "wins": db_user.wins,
        "losses": db_user.losses,
        "total_games": db_user.total_games
    }