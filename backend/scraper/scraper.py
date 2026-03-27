import os
import requests
from bs4 import BeautifulSoup
import sqlite3
import csv
import time

conn = sqlite3.connect("nirf.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS rankings (
    id TEXT,
    name TEXT,
    tlr REAL,
    rpc REAL,
    go REAL,
    oi REAL,
    perception REAL,
    city TEXT,
    state TEXT,
    total REAL,
    rank INTEGER,
    year INTEGER,
    domain TEXT,
    latitude REAL,
    longitude REAL         
)
""")

conn.commit()
headers = {
    "User-Agent": "Mozilla/5.0"
}
response=""

years=[2025,2024,2023,2022,2021]
domains=["Overall","Research","Engineering","Management"]

csv_file = 'nirf.csv'
file_exists = os.path.exists(csv_file)

geo_cache={}

#get longitude latitude
def get_lat_lon(city,state):
    
    key=(city,state)
    if key in geo_cache:
        return geo_cache[key]
    
    url = f"https://nominatim.openstreetmap.org/search?q={city},{state},India&format=json"
    
    try:
        print(f"Getting location for {city},{state}")
        res = requests.get(url, headers={"User-Agent": "nirf-project"})
        data = res.json()
        
        if len(data) > 0:
            lat = data[0]["lat"]
            lon = data[0]["lon"]
        else:
            lat, lon = None, None
        
    except:
        lat, lon = None, None
    
    geo_cache[key] = (lat, lon)
    time.sleep(1)  # (avoid rate limit)

    return lat, lon

#headers for csv file
with open(csv_file, 'a', newline='', encoding='utf-8') as fp:
    writer = csv.writer(fp)
    print("Making headers for csv")
    if not file_exists:
        writer.writerow([
            "id", "name", "tlr", "rpc", "go", "oi", "perception",
            "city", "state", "total", "rank", "year", "domain",
            "latitude", "longitude"
        ])

html_dir = "scraped_html"
os.makedirs(html_dir, exist_ok=True)
for year in years:
    for domain in domains:
        url = f"https://www.nirfindia.org/Rankings/{year}/{domain}Ranking.html"
        filename = os.path.join(html_dir, f"nirf_{year}_{domain}.html")


        if not os.path.exists(filename):
            print(f"Downloading {year},{domain} rankings")
            response = requests.get(url,headers=headers)
            if response.status_code != 200:
                print("Failed to fetch page")
                exit()
            with open(filename, "w", encoding="utf-8") as f:
                f.write(response.text)
        else:
            print("Using cached file")

        with open(filename, "r", encoding="utf-8") as f:
            html = f.read()



        soup = BeautifulSoup(html, "html.parser")

        # Find table 
        table = soup.find("table",id="tbl_overall")

        if table is None:
            print(f"Table not found! {year},{domain}")
            exit()

        data = []
        tbody=table.find("tbody")
        rows=tbody.find_all("tr",recursive=False)
        for row in rows:  
            cols = row.find_all("td")
            
            if len(cols) > 0:
                row_data = []
                city=""
                state=""
                for i, col in enumerate(cols):
                    text = " ".join(col.text.split())
                    
                    # only take the name
                    if i == 1:
                        text = text.split("More Details")[0].strip()
                    
                    row_data.append(text)
                
                data.append(row_data)

        
        # Print sample
        print(f"Year:{year},Domain:{domain}:")
        for d in data[:10]:
            print(d)

        for row in data:
            city = row[7]
            state = row[8]
            lat, lon = get_lat_lon(city, state)
            row = row + [year, domain, lat, lon]

        #write to csv
        with open(csv_file,'a') as fp:
            writer=csv.writer(fp)
            writer.writerows(data)
            print(f"Written successfully to csv for {domain},{year}")

        #write to sqlite
        for row in data:
            city = row[7]
            state = row[8]
            lat, lon = get_lat_lon(city, state)
            row_extended = row + [year, domain, lat, lon]
            cursor.execute("""
            INSERT INTO rankings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
            """, row_extended )
            print(f"Written to sqlite for {year},{domain}")
        
        conn.commit()
        print("uploaded successfully to sqlite3")





conn.close()