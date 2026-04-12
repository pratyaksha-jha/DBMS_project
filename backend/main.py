from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.main import router as api_router
from database.queries import (
    get_new_institutes,
    get_rank_change,
    get_consistent_performers,
    get_top_five,
    get_graph_data
)

app = FastAPI()
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional root route
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

@app.get("/api/new")
def api_new_institutes(domain: str):
    return get_new_institutes(domain.strip().lower())

@app.get("/api/rank-change")
def api_rank_change(domain: str):
    return get_rank_change(domain.strip().lower())

@app.get("/api/consistent")
def api_consistent(domain: str):
    return get_consistent_performers(domain.strip().lower())

@app.get("/api/top-five")
def api_top_five(domain: str, year: int):
    return get_top_five(domain.strip().lower(), year)

@app.get("/api/graph")
def api_graph(domain: str, year: int):
    return get_graph_data(domain.strip().lower(), year)