import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "clean_nirf.db")

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