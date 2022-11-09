from typing import Union
from fastapi import APIRouter, FastAPI, Depends

from .database import get_db_session
from sqlalchemy.orm import Session

from pydantic import BaseModel

import datetime
from typing import Optional, List

root_router = APIRouter(prefix="/api")


# GET /api/buses - get list of buses (all)

# GET /api/routes - get list of routes (all)

# GET /api/stops - get list of stops (all)



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
    print(filters)
    print(db)
    
    return [
        StopInfoSchema(
            id=10,
            num_times_stopped=15,
            total_people_on=40,
            total_people_off=50,
            avg_wait_time=304.55,
            min_wait_time=123,
            max_wait_time=600,
        ),
        StopInfoSchema(
            id=10,
            num_times_stopped=15,
            total_people_on=40,
            total_people_off=50,
            avg_wait_time=304.55,
            min_wait_time=123,
            max_wait_time=600,
        ),
    ]



# GET /api/data/businfo - get travel distance for buses (with filters in JSON body)


@root_router.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}



app = FastAPI()
app.include_router(root_router)