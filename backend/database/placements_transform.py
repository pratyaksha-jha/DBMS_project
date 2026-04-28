import sqlite3

# CONNECT
src_conn = sqlite3.connect("../scraper/nirf_placements.db")
src_cursor = src_conn.cursor()

dest_conn = sqlite3.connect("../data/clean_nirf.db")
dest_cursor = dest_conn.cursor()

# DROP OLD TABLE (safe)
#dest_cursor.execute("DROP TABLE IF EXISTS placements")

# CREATE TABLE
dest_cursor.execute("""
CREATE TABLE placements (
    id TEXT,
    nirf_year INTEGER,
    domain TEXT,
    program_type TEXT,
    academic_year TEXT,

    grad_students REAL,
    placed_students REAL,
    median_salary REAL,
    higher_studies REAL,

    PRIMARY KEY (id, nirf_year, domain, program_type, academic_year)
)
""")

# FETCH
src_cursor.execute("SELECT * FROM placements")
rows = src_cursor.fetchall()

print(f"Rows fetched: {len(rows)}")

# INSERT
dest_cursor.executemany("""
INSERT INTO placements VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", rows)

dest_conn.commit()

src_conn.close()
dest_conn.close()

print("Placements integrated into clean_nirf.db")