from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI()

# Allow frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Temporarily allow all for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    # This specifically targets backend/database/nirf.db
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "database", "nirf.db")
    
    print(f"[*] Looking for database at: {db_path}") # Debug log
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/nirf-data")
def get_nirf_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Using LIKE to ignore case and accidental spaces in your DB
        cursor.execute("""
            SELECT * FROM rankings
            WHERE year = '2025' AND domain LIKE '%overall%'
        """)
        
        rows = cursor.fetchall()
        conn.close()

        data = []
        for row in rows:
            inst = dict(row)
            
            # Ensure coordinates are safely parsed to floats
            try:
                inst['latitude'] = float(inst['latitude']) if inst['latitude'] else None
                inst['longitude'] = float(inst['longitude']) if inst['longitude'] else None
            except (ValueError, TypeError):
                inst['latitude'] = None
                inst['longitude'] = None
                
            data.append(inst)
            
        print(f"[*] Successfully fetched {len(data)} institutes for 2025.") # Debug log
        return data
        
    except Exception as e:
        print(f"[!] Error: {str(e)}")
        return {"error": str(e)}