from sqlalchemy import Column, ForeignKey, Integer, String, Float, Date, Time
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


# DATABASE MODELS

class Bus(Base):
    __tablename__ = "bus"

    id = Column("busid", Integer, primary_key=True)
    code = Column("buscode", String, nullable=False)


class Route(Base):
    __tablename__ = "route"

    id = Column("routeid", Integer, primary_key=True)
    name = Column("name", String, nullable=False)


class Stop(Base):
    __tablename__ = "stop"

    id = Column("stopid", Integer, primary_key=True)
    name = Column("name", String, nullable=False)
    latitude = Column("latitude", Float, nullable=False)
    longitude = Column("longitude", Float, nullable=False)


class StopData(Base):
    __tablename__ = "stopdata"

    id = Column("stopdataid", Integer, primary_key=True)
    bus = Column("busid", Integer, ForeignKey("bus.busid"))
    route = Column("routeid", Integer, ForeignKey("route.routeid"))
    stop = Column("stopid", Integer, ForeignKey("stop.stopid"))
    # timestamp = Column("timestamp", DateTime, nullable=False)
    date = Column("date", Date, nullable=False)
    time = Column("time", Time, nullable=False)
    num_people_on = Column("numpeopleon", Integer)
    num_people_off = Column("numpeopleoff", Integer)
    distance_from_last = Column("distancefromlast", Float)
    wait_time = Column("waittime", Integer)