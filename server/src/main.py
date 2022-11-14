from typing import Union
from fastapi import APIRouter, FastAPI, Depends

from .database import get_db_session
from .database.models import Bus, Route, Stop, StopData
from sqlalchemy.orm import Session
from sqlalchemy import func

from pydantic import BaseModel

import datetime
from typing import Optional, List

root_router = APIRouter(prefix="/api")


# GET /api/buses - get list of buses (all)

class BusSchema(BaseModel):
    id: int
    code: int

@root_router.get("/data/bus", response_model=List[BusSchema])
def fetch_routes(
    db: Session = Depends(get_db_session),
):
    results = db.query(
        Bus.id.label("id"),
        Route.code.label("Route")).all()

    return results

# GET /api/routes - get list of routes (all)

class RouteSchema(BaseModel):
    id: int
    name: str

@root_router.get("/data/routes", response_model=List[RouteSchema])
def fetch_routes(
    db: Session = Depends(get_db_session),
):
    results = db.query(
        Route.id.label("id"),
        Route.name.label("route")).all()

    return results

# GET /api/stops - get list of stops (all)

class StopSchema(BaseModel):
    id: int
    stop: str
    
@root_router.get("/data/stops", response_model=List[StopSchema])
def fetch_routes(
    db: Session = Depends(get_db_session),
):
    results = db.query(
        Stop.id.label("id"),
        Stop.stop.label("bus_id")).all()

    return results




# filters:
# - min date, max date
# - min time, max time
# - bus ids
# - route ids



# example with Pydantic for defining parameters for requests (shared with stopinfo and businfo)
class DataFilterSchema(BaseModel):
    min_date: datetime.date
    max_date: datetime.date
    min_time: datetime.time
    max_time: datetime.time
    bus_ids: List[int]
    route_ids: List[int]




# POST /api/data/stopinfo - get info for stops (with filters in JSON body)
#     # people on, # people off, # times stopped, avg/min/max wait time

class StopInfoSchema(BaseModel):
    id: int
    num_times_stopped: int
    total_people_on: int
    total_people_off: int
    avg_wait_time: float
    min_wait_time: int
    max_wait_time: int


@root_router.post("/data/stopinfo", response_model=List[StopInfoSchema])
def fetch_stop_info(
    filters: DataFilterSchema,
    db: Session = Depends(get_db_session),
):
    results = db.query(
        StopData.stop.label("id"),
        func.count(StopData.id).label("num_times_stopped"),
        func.sum(StopData.num_people_on).label("total_people_on"),
        func.sum(StopData.num_people_off).label("total_people_off"),
        func.avg(StopData.wait_time).label("avg_wait_time"),
        func.min(StopData.wait_time).label("min_wait_time"),
        func.max(StopData.wait_time).label("max_wait_time"),
    ).select_from(StopData).group_by(StopData.stop).where(
        StopData.date.between(filters.min_date, filters.max_date),
        StopData.time.between(filters.min_time, filters.max_time),
        StopData.bus.in_(filters.bus_ids),
        StopData.route.in_(filters.route_ids),
    ).all()

    return results


# GET /api/data/businfo - get travel distance for buses (with filters in JSON body)
class BusInfoSchema(BaseModel):
    id: int
    num_times_stopped: int
    total_people_on: int
    total_people_off: int
    avg_wait_time: float
    min_wait_time: int
    max_wait_time: int


@root_router.post("/data/businfo", response_model=List[BusInfoSchema])
def fetch_stop_info(
    filters: DataFilterSchema,
    db: Session = Depends(get_db_session),
):
    results = db.query(
        StopData.stop.label("id"),
        func.count(StopData.id).label("num_times_stopped"),
        func.sum(StopData.num_people_on).label("total_people_on"),
        func.sum(StopData.num_people_off).label("total_people_off"),
        func.avg(StopData.wait_time).label("avg_wait_time"),
        func.min(StopData.wait_time).label("min_wait_time"),
        func.max(StopData.wait_time).label("max_wait_time"),
    ).select_from(StopData).group_by(StopData.route).where(
        StopData.date.between(filters.min_date, filters.max_date),
        StopData.time.between(filters.min_time, filters.max_time),
        StopData.bus.in_(filters.bus_ids),
        StopData.route.in_(filters.route_ids),
    ).all()

    return results


@root_router.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}



app = FastAPI()
app.include_router(root_router)
