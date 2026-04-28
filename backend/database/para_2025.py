import sqlite3
import pandas as pd
import os


# -----------------------------
# PATH SETUP
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.join(BASE_DIR, "..", "data", "clean_nirf.db")
CSV_PATH = os.path.join(BASE_DIR, "nirf_all.csv")


# -----------------------------
# CONNECT DB
# -----------------------------
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS para_2025")
conn.commit()
print("Old table deleted")


# -----------------------------
# CREATE TABLE
# -----------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS para_2025 (
    id TEXT,
    domain TEXT,
    rank INTEGER,

    SS REAL, FSR REAL, FQE REAL, FRU REAL,
    PU REAL, QP REAL, IPR REAL, FPPP REAL,
    GPH REAL, GUE REAL, MS REAL, GPHD REAL,
    RD REAL, WD REAL, ESCS REAL, PCS REAL,
    PR REAL,
    OE_MIR REAL,

    PRIMARY KEY (id, domain),
    FOREIGN KEY (id) REFERENCES institutes(id)
)
""")

conn.commit()


# -----------------------------
# LOAD CSV
# -----------------------------
df = pd.read_csv(CSV_PATH)

print("Columns:", df.columns)


# -----------------------------
# INSERT DATA
# -----------------------------
count = 0

for _, row in df.iterrows():

    cursor.execute("""
    INSERT OR IGNORE INTO para_2025 VALUES (
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    """, (
        row.get("insti_id"),
        row.get("domain"),
        row.get("rank"),

        row.get("SS"), row.get("FSR"), row.get("FQE"), row.get("FRU"),
        row.get("PU"), row.get("QP"), row.get("IPR"), row.get("FPPP"),
        row.get("GPH"), row.get("GUE"), row.get("MS"), row.get("GPHD"),
        row.get("RD"), row.get("WD"), row.get("ESCS"), row.get("PCS"),
        row.get("PR"),
        row.get("OE+MIR")
    ))

    count += 1


# -----------------------------
# COMMIT & CLOSE
# -----------------------------
conn.commit()
conn.close()

print(f" Inserted {count} rows into para_2025")