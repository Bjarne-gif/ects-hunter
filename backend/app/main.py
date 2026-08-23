"""
FernUni Hagen – Modul- & Notentracker
Backend API (FastAPI)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.db_router import router as db_router
from .routers.student_router import router as student_router
from .routers.modules_router import router as modules_router
from .routers.stats_router import router as stats_router

app = FastAPI(
    title="FernUni Hagen – Modul- & Notentracker",
    description="Inoffizieller Tracker für den BSc Wirtschaftsinformatik",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api"

app.include_router(db_router,      prefix=PREFIX)
app.include_router(student_router, prefix=PREFIX)
app.include_router(modules_router, prefix=PREFIX)
app.include_router(stats_router,   prefix=PREFIX)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "fernuni-tracker"}
