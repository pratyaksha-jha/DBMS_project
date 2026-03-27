import sqlite3


# CONNECT DATABASES


raw_conn = sqlite3.connect("../scraper/nirf.db")
raw_cursor = raw_conn.cursor()

clean_conn = sqlite3.connect("../data/clean_nirf.db")
clean_cursor = clean_conn.cursor()



# CREATE TABLES


clean_cursor.execute("""
CREATE TABLE IF NOT EXISTS institutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    city TEXT,
    state TEXT,
    latitude REAL,
    longitude REAL
)
""")

clean_cursor.execute("""
CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER,
    year INTEGER,
    domain TEXT,
    rank INTEGER,
    score REAL,
    PRIMARY KEY (id, year, domain),
    FOREIGN KEY (id) REFERENCES institutes(id)
)
""")

clean_cursor.execute("""
CREATE TABLE IF NOT EXISTS parameters (
    id INTEGER,
    year INTEGER,
    domain TEXT,
    tlr REAL,
    rpc REAL,
    go REAL,
    oi REAL,
    pr REAL,
    PRIMARY KEY (id, year, domain),
    FOREIGN KEY (id) REFERENCES institutes(id)
)
""")

clean_conn.commit()



# FETCH RAW DATA


raw_cursor.execute("SELECT * FROM rankings")
rows = raw_cursor.fetchall()

print(f"Total rows fetched: {len(rows)}")



# PROCESS DATA


institute_map = {}
count = 0

for row in rows:
    (
        _id, name, tlr, rpc, go, oi, perception,
        city, state, total, rank, year, domain,
        lat, lon
    ) = row

    
    # INSERT INTO INSTITUTES
    

    if name not in institute_map:
        clean_cursor.execute("""
        INSERT OR IGNORE INTO institutes (name, city, state, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
        """, (name, city, state, lat, lon))

        clean_cursor.execute("""
        SELECT id FROM institutes WHERE name = ?
        """, (name,))
        inst_id = clean_cursor.fetchone()[0]

        institute_map[name] = inst_id
    else:
        inst_id = institute_map[name]


    
    # INSERT INTO RANKINGS
    

    clean_cursor.execute("""
    INSERT OR IGNORE INTO rankings (id, year, domain, rank, score)
    VALUES (?, ?, ?, ?, ?)
    """, (inst_id, year, domain, rank, total))


    
    # INSERT INTO PARAMETERS
    

    clean_cursor.execute("""
    INSERT OR IGNORE INTO parameters
    (id, year, domain, tlr, rpc, go, oi, pr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (inst_id, year, domain, tlr, rpc, go, oi, perception))

    count += 1



# FINAL COMMIT


clean_conn.commit()

raw_conn.close()
clean_conn.close()

print(f"Data transformed successfully! Rows processed: {count}")