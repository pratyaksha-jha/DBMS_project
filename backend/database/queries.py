import sqlite3

conn = sqlite3.connect("../data/clean_nirf.db")
cursor = conn.cursor()



# 1. TOP 5 INSTITUTES (by rank)

print("\nTop 5 Institutes (2025 - Overall):")

cursor.execute("""
SELECT i.name, r.rank
FROM rankings r
JOIN institutes i ON r.id = i.id
WHERE r.year = 2025 AND r.domain = 'Overall'
ORDER BY r.rank ASC
LIMIT 5;
""")

for row in cursor.fetchall():
    print(row)



# 2. TOP 5 BY RPC

print("\nTop 5 Institutes by RPC (2025):")

cursor.execute("""
SELECT i.name, p.rpc
FROM parameters p
JOIN institutes i ON p.id = i.id
WHERE p.year = 2025 AND p.domain = 'Overall'
ORDER BY p.rpc DESC
LIMIT 5;
""")

for row in cursor.fetchall():
    print(row)



# 3. NEW INSTITUTES 

print("\nNew Institutes in 2025:")

cursor.execute("""
SELECT DISTINCT i.name
FROM rankings r
JOIN institutes i ON r.id = i.id
WHERE r.year = 2025
AND r.id NOT IN (
    SELECT id FROM rankings WHERE year = 2024
);
""")

for row in cursor.fetchall():
    print(row)



# 4. RANK IMPROVEMENT (Top 5)

print("\nTop 5 Improvements (2024 → 2025):")

cursor.execute("""
SELECT i.name, (r1.rank - r2.rank) AS improvement
FROM rankings r1
JOIN rankings r2 ON r1.id = r2.id
JOIN institutes i ON i.id = r1.id
WHERE r1.year = 2024 AND r2.year = 2025
AND r1.domain = 'Overall' AND r2.domain = 'Overall'
ORDER BY improvement DESC
LIMIT 5;
""")

for row in cursor.fetchall():
    print(row)



# 5. INSTITUTES PER STATE

print("\nInstitutes per State:")

cursor.execute("""
SELECT state, COUNT(*) 
FROM institutes
GROUP BY state
ORDER BY COUNT(*) DESC;
""")

for row in cursor.fetchall():
    print(row)


conn.close()