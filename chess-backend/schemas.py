from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    wins: int = 0
    losses: int = 0
    total_games: int = 0

    class Config:
        from_attributes = True

class MatchRecordCreate(BaseModel):
    user_id: int
    mode: str     # "computer" or "friend"
    result: str   # "win", "loss", or "draw"