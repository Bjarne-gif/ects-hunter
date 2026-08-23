from fastapi import APIRouter, HTTPException
from typing import List

from ..schemas import DbCreate, DbOpen, DbInfo
from ..session import list_databases, create_database, open_database, close_database, active_name

router = APIRouter(prefix="/databases", tags=["databases"])


@router.get("", response_model=List[DbInfo])
def get_databases():
    return list_databases()


@router.get("/active")
def get_active():
    name = active_name()
    return {"active": name}


@router.post("", status_code=201)
def create_db(body: DbCreate):
    try:
        create_database(body.name, body.password)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"status": "created", "name": body.name}


@router.post("/{name}/open")
def open_db(name: str, body: DbOpen):
    try:
        open_database(name, body.password)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))
    except ValueError as e:
        raise HTTPException(401, str(e))
    return {"status": "opened", "name": name}


@router.post("/close")
def close_db():
    close_database()
    return {"status": "closed"}
