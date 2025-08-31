from sqlmodel import SQLModel, create_engine, Session
from .core.config import settings

# Ensure UTF8MB4 for Thai characters
DATABASE_URL = (
    f"mysql+pymysql://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

def get_session():
    with Session(engine) as session:
        yield session
