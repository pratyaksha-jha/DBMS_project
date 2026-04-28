import json
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
DB_PATH = os.path.join(DATA_DIR, "clean_nirf.db")
SHADOW_METRICS_JSON = os.path.join(DATA_DIR, "shadow_metrics.json")

IIT_GUWAHATI_NAME = "Indian Institute of Technology Guwahati"
IIT_HYDERABAD_NAME = "Indian Institute of Technology Hyderabad"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_new_institutes(domain):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT i.name 
        FROM rankings r
        JOIN institutes i ON r.id = i.id
        WHERE r.year = 2025 AND LOWER(r.domain) = ?
        AND i.id NOT IN (
            SELECT id FROM rankings WHERE year = 2024 AND LOWER(domain) = ?
        )
    """, (domain, domain))

    result = [row["name"] for row in cursor.fetchall()]
    conn.close()
    return result


def get_rank_change(domain):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT i.name, r2024.rank as old_rank, r2025.rank as new_rank,
               (r2024.rank - r2025.rank) AS change
        FROM rankings r2024
        JOIN rankings r2025 ON r2024.id = r2025.id
        JOIN institutes i ON i.id = r2024.id
        WHERE r2024.year = 2024 AND r2025.year = 2025
        AND LOWER(r2024.domain) = ? AND LOWER(r2025.domain) = ?
        ORDER BY change DESC
    """, (domain, domain))

    result = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return result


def get_consistent_performers(domain, top_n=10):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT i.name, COUNT(*) as appearances
        FROM rankings r
        JOIN institutes i ON r.id = i.id
        WHERE r.rank <= ? AND LOWER(r.domain) = ?
        GROUP BY r.id HAVING COUNT(*) >= 3
        ORDER BY appearances DESC
    """, (top_n, domain))

    result = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return result


def get_top_five(domain, year):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.rank, i.name 
        FROM rankings r
        JOIN institutes i ON r.id = i.id
        WHERE LOWER(r.domain) = ? AND r.year = ?
        ORDER BY r.rank ASC LIMIT 5
    """, (domain, year))

    result = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return result


def get_graph_data(domain, year):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.rank, p.rpc, p.tlr, p.pr, i.name, r.year
        FROM rankings r
        JOIN parameters p ON r.id = p.id AND r.year = p.year
        JOIN institutes i ON r.id = i.id
        WHERE LOWER(r.domain) = ? AND r.year = ?
        ORDER BY r.rank ASC
    """, (domain, year))

    result = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return result

def list_institutes_excluding_iitg(domain: str, top_n: int | None = None):
    """All institutes in the domain (2025), excluding IIT Guwahati, optionally limited by rank."""
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT i.name
        FROM institutes i
        JOIN rankings r ON i.id = r.id
        WHERE r.year = 2025
        AND LOWER(r.domain) = LOWER(?)
        AND LOWER(i.name) != LOWER(?)
        ORDER BY r.rank ASC
    """

    params: list = [domain, IIT_GUWAHATI_NAME]

    cursor.execute(query, tuple(params))

    rows = cursor.fetchall()
    conn.close()

    return [row["name"] for row in rows]


def linegraph(domain, institute):
    conn = get_connection()
    cursor = conn.cursor()
    domain_l = domain.strip().lower()

    # Query 1: IIT Guwahati for the selected domain
    cursor.execute("""
        SELECT r.year, r.score
        FROM rankings r
        JOIN institutes i ON r.id = i.id
        WHERE LOWER(i.name) = LOWER(?)
        AND LOWER(r.domain) = LOWER(?)
        ORDER BY r.year
    """, (IIT_GUWAHATI_NAME, domain_l))
    iitgrows = cursor.fetchall()

    iitg_used_fallback = False
    # Some domains may have no IIT Guwahati series in the DB; use Overall so the red line still plots.
    if not iitgrows and domain_l != "overall":
        cursor.execute("""
            SELECT r.year, r.score
            FROM rankings r
            JOIN institutes i ON r.id = i.id
            WHERE LOWER(i.name) = LOWER(?)
            AND LOWER(r.domain) = 'overall'
            ORDER BY r.year
        """, (IIT_GUWAHATI_NAME,))
        iitgrows = cursor.fetchall()
        iitg_used_fallback = bool(iitgrows)

    # Query 2: Selected institute (blue line), always for the selected domain
    cursor.execute("""
        SELECT r.year, r.score
        FROM rankings r
        JOIN institutes i ON r.id = i.id
        WHERE LOWER(i.name) = LOWER(?)
        AND LOWER(r.domain) = LOWER(?)
        ORDER BY r.year
    """, (institute, domain_l))
    instrows = cursor.fetchall()

    conn.close()

    # Build year -> score dicts
    iitgdata = {row["year"]: row["score"] for row in iitgrows}
    instdata = {row["year"]: row["score"] for row in instrows}

    # Union of all years, sorted
    years = sorted(set(iitgdata.keys()) | set(instdata.keys()))

    return {
        "years": years,
        "iitg": [iitgdata.get(y, None) for y in years],
        "other": [instdata.get(y, None) for y in years],
        "iitg_used_fallback": iitg_used_fallback,
    }


def get_shadow_metric_comparison():
    """Load IIT Guwahati vs IIT Hyderabad parameter scores from data/shadow_metrics.json (from ghu.jpg / hyd.jpg snapshots)."""
    with open(SHADOW_METRICS_JSON, encoding="utf-8") as f:
        return json.load(f)
    

def iitg_iith(domain):
    conn = get_connection()
    cursor = conn.cursor()
    domain_l = domain.strip().lower()

    cursor.execute("""
        SELECT r.year, r.score
        FROM ghy_hyd_data_10years r
        WHERE LOWER(r.name) = LOWER(?)
        AND LOWER(r.domain) = LOWER(?)
        ORDER BY r.year
    """, (IIT_GUWAHATI_NAME, domain_l))
    iitgrows = cursor.fetchall()

    cursor.execute("""
        SELECT r.year, r.score
        FROM ghy_hyd_data_10years r
        WHERE LOWER(r.name) = LOWER(?)
        AND LOWER(r.domain) = LOWER(?)
        ORDER BY r.year
    """, (IIT_HYDERABAD_NAME, domain_l))
    iithrows = cursor.fetchall()

    conn.close()

    iitgdata = {row["year"]: row["score"] for row in iitgrows}
    iithdata = {row["year"]: row["score"] for row in iithrows}
    years = sorted(set(iitgdata.keys()) | set(iithdata.keys()))

    return {
        "years": years,
        "iitg": [iitgdata.get(y, None) for y in years],
        "iith": [iithdata.get(y, None) for y in years],
    }