from typing import Union
from fastapi import APIRouter, FastAPI



root_router = APIRouter(prefix="/api")



@root_router.get("/")
def read_root():
    return {"Hello": "World"}


@root_router.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}



app = FastAPI()
app.include_router(root_router)