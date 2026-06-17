from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User, Department
from app.core.security import get_password_hash
from app.core.database import Base

Base.metadata.create_all(bind=engine)

db = SessionLocal()

admin = db.query(User).filter(User.email == "admin@example.com").first()
if not admin:
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="System Admin",
        role="Admin"
    )
    db.add(admin)

head = db.query(User).filter(User.email == "head@example.com").first()
if not head:
    head = User(
        email="head@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Department Head",
        role="Department Head"
    )
    db.add(head)

db.commit()
db.close()
print("Seeded admin@example.com and head@example.com with password: password123")
