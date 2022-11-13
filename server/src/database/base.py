from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sshtunnel
import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str
    DB_SSH_KEY_PATH: str = None
    DB_CONNECTION_URL: str

    class Config:
        env_file = ".env"


settings = Settings()



if settings.ENVIRONMENT == "local":
    server = sshtunnel.SSHTunnelForwarder(
        "transit-ninerlytics.com",
        ssh_username="ec2-user",
        ssh_pkey=settings.DB_SSH_KEY_PATH,
        remote_bind_address=("database-2.ccxeki6fimht.us-east-2.rds.amazonaws.com", 3306),
        local_bind_address=("127.0.0.1", 5445),
    )
    server.start()


engine = create_engine(settings.DB_CONNECTION_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
