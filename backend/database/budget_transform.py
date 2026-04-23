import sqlite3

# -----------------------------
# CONNECT DATABASES
# -----------------------------

budget_conn = sqlite3.connect("../scraper/nirf_budget.db")
budget_cursor = budget_conn.cursor()

clean_conn = sqlite3.connect("../data/clean_nirf.db")
clean_cursor = clean_conn.cursor()


# -----------------------------
# CREATE TABLE
# -----------------------------

clean_cursor.execute("""
CREATE TABLE IF NOT EXISTS budget (
    id TEXT,
    nirf_year INTEGER,
    domain TEXT,
    fin_year TEXT,

    library REAL,
    equipment REAL,
    workshops REAL,
    studios REAL,
    capital_assets REAL,

    salaries REAL,
    maintenance REAL,
    seminars REAL,

    research_amount REAL,
    consultancy_amount REAL,

    sponsored_projects REAL,
    funding_agencies REAL
)
""")

clean_conn.commit()


# -----------------------------
# FETCH DATA
# -----------------------------

budget_cursor.execute("SELECT * FROM nirf_data")
rows = budget_cursor.fetchall()

print(f"Budget rows fetched: {len(rows)}")


# -----------------------------
# INSERT DATA
# -----------------------------

count = 0

for row in rows:
    clean_cursor.execute("""
    INSERT INTO budget VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, row)

    count += 1


# -----------------------------
# FINAL COMMIT
# -----------------------------

clean_conn.commit()

budget_conn.close()
clean_conn.close()

print(f" Budget integrated! Rows inserted: {count}")