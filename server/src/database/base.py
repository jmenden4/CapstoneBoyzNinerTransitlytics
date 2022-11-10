from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sshtunnel

server = sshtunnel.SSHTunnelForwarder(
    "transit-ninerlytics.com",
    ssh_username="ec2-user",
    ssh_pkey=r"C:\Users\Jon\Documents\School\Fall 2022\ITCS-4155\admin.pem",
    remote_bind_address=("database-2.ccxeki6fimht.us-east-2.rds.amazonaws.com", 3306),
    local_bind_address=("127.0.0.1", 5445),
)
server.start()

SQLALCHEMY_DB_URL = "mysql://admin:CapstoneBoyz@localhost:5445/transitninerlytics"
# SQLALCHEMY_DB_URL = "mysql://datauser:datauser@localhost/transitninerlytics"
engine = create_engine(SQLALCHEMY_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
