import os
import requests
import pdfplumber
from bs4 import BeautifulSoup
from io import BytesIO
import pandas as pd
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# DB SETUP
conn = sqlite3.connect("nirf_budget.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS nirf_data (
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
    funding_agencies REAL,
    PRIMARY KEY (id,domain,fin_year)
)
""")
conn.commit()

# CONFIG
session = requests.Session()
headers = {"User-Agent": "Mozilla/5.0"}

domains = ["Overall", "Engineering", "Management"]
years = [2025]

pdf_cache = {}

# LOAD PDF
def load_pdf(pdf_url):
    if pdf_url in pdf_cache:
        return pdf_cache[pdf_url]

    # SSL fix
    response = session.get(pdf_url, headers=headers, verify=False)

    pdf = pdfplumber.open(BytesIO(response.content))
    pdf_cache[pdf_url] = pdf
    return pdf

# CAPITAL EXPENDITURE
def capital_exp(pdf):
    data = {"library": None, "equipment": None,
            "workshops": None, "studios": None,
            "capital_assets": None}

    for page in pdf.pages:
        text = page.extract_text()
        if not text or "capital expenditure" not in text.lower():
            continue

        for table in page.extract_tables() or []:
            for row in table:
                if not row:
                    continue

                cat = " ".join([str(c).lower() for c in row if c])
                values = [
                    c.split("(")[0].strip().replace(",", "")
                    for c in row if c and any(x.isdigit() for x in c)
                ]

                if len(values) != 3:
                    continue

                if "library" in cat:
                    data["library"] = values
                elif "laborator" in cat:
                    data["equipment"] = values
                elif "workshop" in cat:
                    data["workshops"] = values
                elif "studio" in cat:
                    data["studios"] = values
                elif "other expenditure" in cat:
                    data["capital_assets"] = values

        break 

    return data

# OPERATIONAL EXPENDITURE
def oper_exp(pdf):
    data = {"salaries": None, "maintenance": None, "seminars": None}

    for page in pdf.pages:
        text = page.extract_text()
        if not text or "operational expenditure" not in text.lower():
            continue

        for table in page.extract_tables() or []:
            for row in table:
                if not row:
                    continue

                cat = " ".join([str(c).lower() for c in row if c])
                values = [
                    c.split("(")[0].strip().replace(",", "")
                    for c in row if c and any(x.isdigit() for x in c)
                ]

                if len(values) != 3:
                    continue

                if "salaries" in cat:
                    data["salaries"] = values
                elif "maintenance" in cat:
                    data["maintenance"] = values
                elif "seminars" in cat:
                    data["seminars"] = values

        break

    return data

# RESEARCH & CONSULTANCY
def research_consult(pdf):
    research = None
    consultancy = None

    in_research = False
    in_consult = False

    for page in pdf.pages:
        for table in page.extract_tables() or []:
            for row in table:
                if not row:
                    continue

                text = " ".join([str(c).lower() for c in row if c])

                if "sponsored" in text:
                    in_research = True
                    in_consult = False
                elif "consultancy" in text:
                    in_consult = True
                    in_research = False

                if "amount in rupees" in text:
                    values = [
                        c.strip().replace(",", "")
                        for c in row if c and any(x.isdigit() for x in c)
                    ]

                    if len(values) == 3:
                        if in_research:
                            research = values
                        elif in_consult:
                            consultancy = values

        if research and consultancy:
            break

    return research, consultancy

# SPONSORED RESEARCH (no change)
def sponsored_research(pdf):
    data = {
        "projects": None,
        "agencies": None
    }

    for page in pdf.pages:
        text = page.extract_text()

        if not text or "sponsored research details" not in text.lower():
            continue

        for table in page.extract_tables() or []:
            for row in table:
                if not row:
                    continue

                row_text = " ".join([str(c).lower() for c in row if c])

                values = [
                    c.split("(")[0].strip().replace(",", "")
                    for c in row if c and any(x.isdigit() for x in c)
                ]

                if len(values) != 3:
                    continue

                if "total no. of sponsored projects" in row_text:
                    data["projects"] = values
                elif "total no. of funding agencies" in row_text:
                    data["agencies"] = values

        break

    return data

# PROCESS EACH INSTITUTE (no logic change)
def process_institute(row, year, domain):
    cols = row.find_all("td")
    if not cols:
        return []

    insti_ID = cols[0].text.strip()

    pdf_url = None
    for a in row.find_all("a", href=True):
        if ".pdf" in a["href"]:
            pdf_url = a["href"]
            break

    if not pdf_url:
        return []

    try:
        pdf = load_pdf(pdf_url)

        cap = capital_exp(pdf)
        op = oper_exp(pdf)
        res, con = research_consult(pdf)
        sr = sponsored_research(pdf)

        years_list = ["2023-24", "2022-23", "2021-22"]

        results = []

        for i in range(3):
            row_data = (
                insti_ID, year, domain, years_list[i],

                float(cap["library"][i]) if cap["library"] else None,
                float(cap["equipment"][i]) if cap["equipment"] else None,
                float(cap["workshops"][i]) if cap["workshops"] else None,
                float(cap["studios"][i]) if cap["studios"] else None,
                float(cap["capital_assets"][i]) if cap["capital_assets"] else None,

                float(op["salaries"][i]) if op["salaries"] else None,
                float(op["maintenance"][i]) if op["maintenance"] else None,
                float(op["seminars"][i]) if op["seminars"] else None,

                float(res[i]) if res else None,
                float(con[i]) if con else None,

                float(sr["projects"][i]) if sr["projects"] and len(sr["projects"]) > i else None,
                float(sr["agencies"][i]) if sr["agencies"] and len(sr["agencies"]) > i else None
            )

            results.append(row_data)

        print(f"Done: {insti_ID}")
        return results

    except Exception as e:
        print(f"Error {insti_ID}: {e}")
        return []

# MAIN LOOP
all_data = []

for year in years:
    for domain in domains:

        url = f"https://www.nirfindia.org/Rankings/{year}/{domain}Ranking.html"

        # 🔴 FIX 3: SSL fix here also
        response = session.get(url, headers=headers, verify=False)

        if response.status_code != 200:
            print(f"Failed for {domain}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        rows = soup.find("table").find_all("tr")

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(process_institute, row, year, domain) for row in rows]

            for future in futures:
                results = future.result()
                all_data.extend(results)

        print(f"Finished: {year}-{domain}")

# INSERT
cursor.executemany("""
INSERT INTO nirf_data VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", all_data)

conn.commit()

<<<<<<< HEAD
# SAVE CSV
columns = [
    "insti_ID", "nirf_year", "domain", "fin_year",
    "library", "equipment", "workshops", "studios", "capital_assets",
    "salaries", "maintenance", "seminars",
    "research_amount", "consultancy_amount",
    "sponsored_projects", "funding_agencies"
]

df = pd.DataFrame(all_data, columns=columns)

os.makedirs("data", exist_ok=True)
df.to_csv("data/nirf_full_budget_data.csv", index=False)

print("\nData saved to CSV and SQLite!")
=======
print("\n✅ Data saved to SQLite!")
>>>>>>> b1e6558443a87eb7eceaf910b3c32f8bd55436f7

conn.close()