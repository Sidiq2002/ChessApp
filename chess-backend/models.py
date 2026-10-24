from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Real-time stats columns (start at 0 for new users)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    total_games = Column(Integer, default=0, nullable=False)


class GameMatch(Base):
    __tablename__ = "game_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mode = Column(String(30), nullable=False)       # 'computer' or 'friend'
    result = Column(String(20), nullable=False)     # 'win', 'loss', or 'draw'
    played_at = Column(DateTime, default=datetime.utcnow)