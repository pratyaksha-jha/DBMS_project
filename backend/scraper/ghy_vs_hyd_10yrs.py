import os
import requests
from bs4 import BeautifulSoup
import sqlite3
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, "..", "data", "clean_nirf.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE ghy_hyd_data_10years(
    name TEXT,
    year INTEGER,
    rank TEXT,
    domain TEXT,
    score REAL   
)
""")
conn.commit()

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]
domains = ["Overall", "Engineering"]

for year in years:
    for domain in domains:
        url = f"https://www.nirfindia.org/Rankings/{year}/{domain}Ranking.html"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.find_all('tr')

            found_institutes = set()

            for row in rows:
                columns = row.find_all('td')
                
                if len(columns) >= 5:
                    #clear popups
                    for hidden_div in row.find_all('div'):
                        hidden_div.decompose() 
                    #delete blank columns
                    row_data = [col.text.strip() for col in columns if col.text.strip() != ""]
                    
                    if len(row_data) >= 4:
                        name = row_data[1]
                        name_lower = name.lower()
                        is_iit = "indian institute of technology" in name_lower
                        not_iiit = "information" not in name_lower
                        is_target_city = "guwahati" in name_lower or "hyderabad" in name_lower

                        if is_iit and not_iiit and is_target_city:
                            if name_lower in found_institutes:
                                continue 
                            found_institutes.add(name_lower)
                            score = row_data[-2]
                            rank = row_data[-1]
                            cursor.execute(
                                'INSERT INTO ghy_hyd_data_10years (name, year, rank, domain, score) VALUES (?, ?, ?, ?, ?)', 
                                (name, year, rank, domain, score)
                            )
                            print(f"Saved: {name}, Rank: {rank}, Score: {score}, {year} {domain}")
            
            conn.commit() 
        else:
            print(f"Failed to fetch for {year}, {domain} - Status Code: {response.status_code}")
            
        time.sleep(2)

conn.close()
print("done scraping")