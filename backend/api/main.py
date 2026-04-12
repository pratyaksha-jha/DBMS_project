from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from fastapi import HTTPException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "clean_nirf.db")
NIRF_MAP_DB_PATH = os.path.join(BASE_DIR, "..", "database", "nirf.db")


router = APIRouter()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # or ["*"] for dev
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Root route
@router.get("/")
def read_root():
    return {"message": "Backend server running"}

@router.get("/institute_analysis/domains")
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

@router.get("/institute_analysis/institutes")
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

@router.get("/institute_analysis/rank_trend")
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

from fastapi import HTTPException
import sqlite3

@router.get("/institute_analysis/rank_trend/parameters")
def get_params(institute: str, domain: str, year: int):
    try:

        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT tlr, rpc, pr, go, oi, score 
                FROM parameters, institutes ,rankings
                WHERE institutes.id = parameters.id AND rankings.id=institutes.id
                  AND institutes.name = ? 
                  AND parameters.year = ? 
                  AND parameters.domain = ?
                  AND rankings.year=?
                  AND rankings.domain=?
            """
            
            result = cursor.execute(query, (institute, year, domain,year,domain)).fetchone()
            
            
            if result:
                return {"parameters": dict(result)}
            else:
                return {"parameters": None}

    except sqlite3.Error as e:
       
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/institute_analysis/budget")
def get_budget(fin_year:str,name:str,domain:str):
    try:

        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT library,equipment,workshops,studios,capital_assets,salaries,maintenance,seminars
                FROM budget, institutes 
                WHERE institutes.id = budget.id 
                  AND budget.fin_year = ?
                  AND budget.domain =?
                  AND institutes.name=?
                  
            """
            
            result = cursor.execute(query, (fin_year,domain,name)).fetchone()
            
            
            if result:
                return {"parameters": dict(result)}
            else:
                return {"parameters": None}

    except sqlite3.Error as e:
       
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

#pratyaksha ka backend
@router.get("/api/nirf-data")
def get_nirf_map_data():
    """Overall 2025 rankings with coordinates for the India map (separate nirf.db)."""
    try:
        conn = sqlite3.connect(NIRF_MAP_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM rankings
            WHERE year = '2025' AND domain LIKE '%overall%'
        """)
        rows = cursor.fetchall()
        conn.close()

        data = []
        for row in rows:
            inst = dict(row)
            try:
                inst["latitude"] = float(inst["latitude"]) if inst.get("latitude") else None
                inst["longitude"] = float(inst["longitude"]) if inst.get("longitude") else None
            except (ValueError, TypeError):
                inst["latitude"] = None
                inst["longitude"] = None
            data.append(inst)
        return data
    except Exception as e:
        return {"error": str(e)}