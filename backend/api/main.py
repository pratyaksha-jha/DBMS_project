from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "clean_nirf.db")



app = FastAPI(
    title="NIRF Analyser",
    description="Starter boilerplate for FastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def read_root():
    return {"message": "Backend server running"}

@app.get("/institute_analysis/domains")
def get_domains():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Fetch domains
    domains = cursor.execute(
        "SELECT DISTINCT domain FROM rankings"
    ).fetchall()

    conn.close()

    return {
        "domains": [d[0] for d in domains]
    }

@app.get("/institute_analysis/institutes")
def get_institutes(domain):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    institutes = cursor.execute(
        """
        SELECT DISTINCT institutes.name
        FROM institutes
        JOIN rankings ON institutes.id = rankings.id
        WHERE rankings.domain=?
        """,(domain,)
    ).fetchall()

    conn.close()

    return {
        "institutes": [i[0] for i in institutes]
    }

@app.get("/institute_analysis/rank_trend")
def get_ranks(institute: str, domain: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    years = [2025, 2024, 2023, 2022, 2021]
    ranks = []

    for year in years:
        query = """
            SELECT rank 
            FROM rankings
            JOIN institutes ON rankings.id = institutes.id
            WHERE institutes.name = ?
            AND rankings.domain = ?
            AND rankings.year = ?
        """
        result = cursor.execute(query, (institute, domain, year)).fetchone()

        ranks.append(result[0] if result else None)

    conn.close()

    return {
        "years": years,
        "ranks": ranks
    }



